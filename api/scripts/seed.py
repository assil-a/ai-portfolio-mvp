#!/usr/bin/env python3
"""
Seed script for AI Portfolio Console
Creates sample projects for development and testing
"""

import asyncio
import sys
from pathlib import Path

# Add the parent directory to the path so we can import our app
sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import get_db
from app.models.project import Project, ProjectContributor
from app.core.config import settings
from datetime import datetime, timedelta
import uuid

async def seed_data():
    """Seed the database with sample data"""
    
    # Sample projects data
    sample_projects = [
        {
            "owner": "facebook",
            "name": "react",
            "html_url": "https://github.com/facebook/react",
            "default_branch": "main",
            "visibility": "public",
            "last_commit_at": datetime.utcnow() - timedelta(hours=2),
            "last_actor": "gaearon",
            "install_status": "app",
        },
        {
            "owner": "microsoft",
            "name": "vscode",
            "html_url": "https://github.com/microsoft/vscode",
            "default_branch": "main",
            "visibility": "public",
            "last_commit_at": datetime.utcnow() - timedelta(days=1),
            "last_actor": "bpasero",
            "install_status": "oauth",
        },
        {
            "owner": "vercel",
            "name": "next.js",
            "html_url": "https://github.com/vercel/next.js",
            "default_branch": "canary",
            "visibility": "public",
            "last_commit_at": datetime.utcnow() - timedelta(hours=6),
            "last_actor": "timneutkens",
            "install_status": "app",
        },
    ]

    # Sample contributors data
    sample_contributors = {
        "facebook/react": [
            {"login": "gaearon", "commits": 45, "last_commit_at": datetime.utcnow() - timedelta(hours=2)},
            {"login": "sebmarkbage", "commits": 23, "last_commit_at": datetime.utcnow() - timedelta(days=3)},
            {"login": "acdlite", "commits": 18, "last_commit_at": datetime.utcnow() - timedelta(days=5)},
        ],
        "microsoft/vscode": [
            {"login": "bpasero", "commits": 67, "last_commit_at": datetime.utcnow() - timedelta(days=1)},
            {"login": "joaomoreno", "commits": 34, "last_commit_at": datetime.utcnow() - timedelta(days=2)},
            {"login": "sandy081", "commits": 28, "last_commit_at": datetime.utcnow() - timedelta(days=4)},
        ],
        "vercel/next.js": [
            {"login": "timneutkens", "commits": 89, "last_commit_at": datetime.utcnow() - timedelta(hours=6)},
            {"login": "ijjk", "commits": 56, "last_commit_at": datetime.utcnow() - timedelta(days=1)},
            {"login": "styfle", "commits": 42, "last_commit_at": datetime.utcnow() - timedelta(days=2)},
        ],
    }

    try:
        # Get database session
        db = next(get_db())
        
        print("🌱 Seeding database with sample data...")
        
        # Create projects
        created_projects = {}
        for project_data in sample_projects:
            # Check if project already exists
            existing = db.query(Project).filter(
                Project.owner == project_data["owner"],
                Project.name == project_data["name"]
            ).first()
            
            if existing:
                print(f"  ⏭️  Project {project_data['owner']}/{project_data['name']} already exists")
                created_projects[f"{project_data['owner']}/{project_data['name']}"] = existing
                continue
            
            project = Project(**project_data)
            db.add(project)
            db.flush()  # Flush to get the ID
            created_projects[f"{project_data['owner']}/{project_data['name']}"] = project
            print(f"  ✅ Created project: {project_data['owner']}/{project_data['name']}")
        
        # Create contributors
        for project_key, contributors in sample_contributors.items():
            if project_key not in created_projects:
                continue
                
            project = created_projects[project_key]
            
            for contributor_data in contributors:
                # Check if contributor already exists
                existing = db.query(ProjectContributor).filter(
                    ProjectContributor.project_id == project.id,
                    ProjectContributor.login == contributor_data["login"]
                ).first()
                
                if existing:
                    continue
                
                contributor = ProjectContributor(
                    project_id=project.id,
                    login=contributor_data["login"],
                    commits_90d=contributor_data["commits"],
                    last_commit_at=contributor_data["last_commit_at"]
                )
                db.add(contributor)
            
            print(f"  👥 Added contributors for {project_key}")
        
        # Update active_contributors_90d count for each project
        for project in created_projects.values():
            contributor_count = db.query(ProjectContributor).filter(
                ProjectContributor.project_id == project.id
            ).count()
            project.active_contributors_90d = contributor_count
        
        db.commit()
        print("✅ Database seeded successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(seed_data())