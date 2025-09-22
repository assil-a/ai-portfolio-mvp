from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..core.database import get_db
from ..schemas import ProjectCreate, ProjectResponse, ProjectsListResponse, ProjectDetail
from ..services.project_service import ProjectService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("/", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db)
):
    """Create a new project by fetching data from GitHub"""
    try:
        service = ProjectService(db)
        project = await service.create_project(project_data)
        
        # Get active contributors count
        active_contributors = len([c for c in project.contributors if c.commits_90d > 0])
        
        return ProjectResponse(
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
    except Exception as e:
        logger.error(f"Failed to create project: {e}")
        if "No access token available" in str(e):
            raise HTTPException(status_code=403, detail=str(e))
        elif "not in the allowed list" in str(e):
            raise HTTPException(status_code=403, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=f"Failed to create project: {str(e)}")


@router.get("/", response_model=ProjectsListResponse)
def get_projects(
    order: str = Query("last_activity_at_desc", description="Sort order"),
    limit: int = Query(50, ge=1, le=100, description="Number of projects to return"),
    offset: int = Query(0, ge=0, description="Number of projects to skip"),
    db: Session = Depends(get_db)
):
    """Get paginated list of projects"""
    try:
        service = ProjectService(db)
        result = service.get_projects(order=order, limit=limit, offset=offset)
        return ProjectsListResponse(**result)
    except Exception as e:
        logger.error(f"Failed to get projects: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve projects")


@router.get("/{project_id}", response_model=ProjectDetail)
def get_project_detail(
    project_id: str,
    db: Session = Depends(get_db)
):
    """Get detailed project information"""
    try:
        service = ProjectService(db)
        project = service.get_project_detail(project_id)
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return project
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get project detail: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve project details")


@router.post("/{project_id}/refresh", response_model=ProjectResponse)
async def refresh_project(
    project_id: str,
    db: Session = Depends(get_db)
):
    """Refresh project data from GitHub"""
    try:
        service = ProjectService(db)
        project = await service.refresh_project(project_id)
        
        # Get active contributors count
        active_contributors = len([c for c in project.contributors if c.commits_90d > 0])
        
        return ProjectResponse(
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
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to refresh project: {e}")
        if "No access token available" in str(e):
            raise HTTPException(status_code=403, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=f"Failed to refresh project: {str(e)}")