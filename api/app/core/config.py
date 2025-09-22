from pydantic_settings import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):
    # Server
    port: int = 8000
    
    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/ai_portfolio"
    
    # GitHub App
    github_app_id: Optional[str] = None
    github_app_private_key: Optional[str] = None
    github_webhook_secret: Optional[str] = None
    
    # GitHub OAuth (fallback)
    oauth_github_client_id: Optional[str] = None
    oauth_github_client_secret: Optional[str] = None
    
    # Business Logic
    contributor_window_days: int = 90
    allowed_orgs: Optional[str] = None  # Comma-separated list
    
    # Admin Auth
    admin_basic_auth_user: Optional[str] = None
    admin_basic_auth_pass: Optional[str] = None
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    
    class Config:
        env_file = ".env"
    
    @property
    def allowed_orgs_list(self) -> List[str]:
        if not self.allowed_orgs:
            return []
        return [org.strip() for org in self.allowed_orgs.split(",")]


settings = Settings()