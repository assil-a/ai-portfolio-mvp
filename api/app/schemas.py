from pydantic import BaseModel, HttpUrl, validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID
import re


class ProjectCreate(BaseModel):
    repo_url: HttpUrl
    
    @validator('repo_url')
    def validate_github_url(cls, v):
        url_str = str(v)
        if not re.match(r'https://github\.com/[^/]+/[^/]+/?$', url_str):
            raise ValueError('Must be a valid GitHub repository URL')
        return v


class ContributorDetail(BaseModel):
    login: str
    commits: int
    last_commit_at: Optional[datetime] = None


class LastOpenPR(BaseModel):
    number: int
    updated_at: datetime
    author: str


class ProjectBase(BaseModel):
    id: UUID
    owner: str
    name: str
    html_url: str
    default_branch: Optional[str] = None
    visibility: Optional[str] = None
    last_commit_at: Optional[datetime] = None
    last_actor: Optional[str] = None
    active_contributors_90d: int
    install_status: str
    created_at: datetime
    updated_at: datetime


class ProjectList(ProjectBase):
    pass


class ProjectDetail(ProjectBase):
    contributors_90d: List[ContributorDetail]
    last_open_pr: Optional[LastOpenPR] = None
    default_branch_ref: Optional[str] = None


class ProjectResponse(ProjectBase):
    pass


class HealthResponse(BaseModel):
    status: str


class ProjectsListResponse(BaseModel):
    projects: List[ProjectList]
    total: int
    limit: int
    offset: int