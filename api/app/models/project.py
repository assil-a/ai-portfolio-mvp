from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, BigInteger, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from ..core.database import Base


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner = Column(Text, nullable=False)
    name = Column(Text, nullable=False)
    html_url = Column(Text, nullable=False)
    default_branch = Column(Text)
    visibility = Column(Text, CheckConstraint("visibility IN ('public','private')"))
    last_commit_at = Column(DateTime(timezone=True))
    last_actor = Column(Text)
    install_status = Column(Text, CheckConstraint("install_status IN ('app','oauth','none')"), default='none')
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    contributors = relationship("ProjectContributor", back_populates="project", cascade="all, delete-orphan")
    refresh_queue = relationship("ProjectRefreshQueue", back_populates="project", cascade="all, delete-orphan")
    
    __table_args__ = (
        CheckConstraint("visibility IN ('public','private')", name='check_visibility'),
        CheckConstraint("install_status IN ('app','oauth','none')", name='check_install_status'),
    )


class ProjectContributor(Base):
    __tablename__ = "project_contributors"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    login = Column(Text, nullable=False)
    commits_90d = Column(Integer, nullable=False, default=0)
    last_commit_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="contributors")


class ProjectRefreshQueue(Base):
    __tablename__ = "project_refresh_queue"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    queued_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    processed_at = Column(DateTime(timezone=True))
    
    # Relationships
    project = relationship("Project", back_populates="refresh_queue")