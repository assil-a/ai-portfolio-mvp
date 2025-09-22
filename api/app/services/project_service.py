from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional, Dict, Any
from datetime import datetime
from ..models.project import Project, ProjectContributor, ProjectRefreshQueue
from ..schemas import ProjectCreate, ProjectList, ProjectDetail, ContributorDetail, LastOpenPR
from .github_client import GitHubClient
import logging

logger = logging.getLogger(__name__)


class ProjectService:
    def __init__(self, db: Session):
        self.db = db
        self.github_client = GitHubClient()
    
    async def create_project(self, project_data: ProjectCreate) -> Project:
        """Create a new project by fetching data from GitHub"""
        repo_url = str(project_data.repo_url)
        
        # Check if project already exists
        owner, repo = self.github_client._parse_github_url(repo_url)
        existing_project = self.db.query(Project).filter(
            Project.owner == owner,
            Project.name == repo
        ).first()
        
        if existing_project:
            # Refresh existing project
            return await self.refresh_project(existing_project.id)
        
        # Fetch data from GitHub
        github_data = await self.github_client.fetch_repository_data(repo_url)
        
        # Create project record
        project = Project(
            owner=github_data["owner"],
            name=github_data["name"],
            html_url=github_data["html_url"],
            default_branch=github_data["default_branch"],
            visibility=github_data["visibility"],
            last_commit_at=github_data["last_commit_at"],
            last_actor=github_data["last_actor"],
            install_status=github_data["install_status"]
        )
        
        self.db.add(project)
        self.db.flush()  # Get the project ID
        
        # Add contributors
        for contributor_data in github_data["contributors"]:
            contributor = ProjectContributor(
                project_id=project.id,
                login=contributor_data["login"],
                commits_90d=contributor_data["commits"],
                last_commit_at=contributor_data["last_commit_at"]
            )
            self.db.add(contributor)
        
        self.db.commit()
        self.db.refresh(project)
        
        logger.info(f"Created project {project.owner}/{project.name} with {len(github_data['contributors'])} contributors")
        return project
    
    def get_projects(self, order: str = "last_activity_at_desc", limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        """Get paginated list of projects"""
        query = self.db.query(Project)
        
        # Apply ordering
        if order == "last_activity_at_desc":
            query = query.order_by(desc(Project.last_commit_at))
        elif order == "last_activity_at_asc":
            query = query.order_by(Project.last_commit_at)
        elif order == "name_asc":
            query = query.order_by(Project.name)
        elif order == "name_desc":
            query = query.order_by(desc(Project.name))
        else:
            query = query.order_by(desc(Project.last_commit_at))
        
        total = query.count()
        projects = query.offset(offset).limit(limit).all()
        
        # Convert to response format
        project_list = []
        for project in projects:
            active_contributors = self.db.query(func.count(ProjectContributor.id)).filter(
                ProjectContributor.project_id == project.id,
                ProjectContributor.commits_90d > 0
            ).scalar() or 0
            
            project_data = ProjectList(
                id=project.id,
                owner=project.owner,
                name=project.name,
                html_url=project.html_url,
                default_branch=project.default_branch,
                visibility=project.visibility,
                last_commit_at=project.last_commit_at,
                last_actor=project.last_actor,
                active_contributors_90d=active_contributors,
                install_status=project.install_status,
                created_at=project.created_at,
                updated_at=project.updated_at
            )
            project_list.append(project_data)
        
        return {
            "projects": project_list,
            "total": total,
            "limit": limit,
            "offset": offset
        }
    
    def get_project_detail(self, project_id: str) -> Optional[ProjectDetail]:
        """Get detailed project information"""
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return None
        
        # Get contributors
        contributors = self.db.query(ProjectContributor).filter(
            ProjectContributor.project_id == project.id
        ).all()
        
        contributors_90d = [
            ContributorDetail(
                login=c.login,
                commits=c.commits_90d,
                last_commit_at=c.last_commit_at
            )
            for c in contributors
        ]
        
        active_contributors = len([c for c in contributors if c.commits_90d > 0])
        
        # For now, we don't store last_open_pr in the database
        # In a real implementation, you might want to cache this data
        last_open_pr = None
        
        return ProjectDetail(
            id=project.id,
            owner=project.owner,
            name=project.name,
            html_url=project.html_url,
            default_branch=project.default_branch,
            visibility=project.visibility,
            last_commit_at=project.last_commit_at,
            last_actor=project.last_actor,
            active_contributors_90d=active_contributors,
            install_status=project.install_status,
            created_at=project.created_at,
            updated_at=project.updated_at,
            contributors_90d=contributors_90d,
            last_open_pr=last_open_pr,
            default_branch_ref=project.default_branch
        )
    
    async def refresh_project(self, project_id: str) -> Project:
        """Refresh project data from GitHub"""
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError("Project not found")
        
        # Fetch fresh data from GitHub
        repo_url = project.html_url
        github_data = await self.github_client.fetch_repository_data(repo_url)
        
        # Update project
        project.default_branch = github_data["default_branch"]
        project.visibility = github_data["visibility"]
        project.last_commit_at = github_data["last_commit_at"]
        project.last_actor = github_data["last_actor"]
        project.install_status = github_data["install_status"]
        project.updated_at = datetime.utcnow()
        
        # Clear existing contributors
        self.db.query(ProjectContributor).filter(
            ProjectContributor.project_id == project.id
        ).delete()
        
        # Add fresh contributors
        for contributor_data in github_data["contributors"]:
            contributor = ProjectContributor(
                project_id=project.id,
                login=contributor_data["login"],
                commits_90d=contributor_data["commits"],
                last_commit_at=contributor_data["last_commit_at"]
            )
            self.db.add(contributor)
        
        self.db.commit()
        self.db.refresh(project)
        
        logger.info(f"Refreshed project {project.owner}/{project.name}")
        return project
    
    def queue_refresh(self, project_id: str) -> None:
        """Queue a project for refresh (for webhook processing)"""
        # Check if already queued
        existing = self.db.query(ProjectRefreshQueue).filter(
            ProjectRefreshQueue.project_id == project_id,
            ProjectRefreshQueue.processed_at.is_(None)
        ).first()
        
        if not existing:
            queue_item = ProjectRefreshQueue(project_id=project_id)
            self.db.add(queue_item)
            self.db.commit()
            logger.info(f"Queued project {project_id} for refresh")