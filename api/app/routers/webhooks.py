from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.config import settings
from ..services.project_service import ProjectService
import hashlib
import hmac
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def verify_github_signature(payload: bytes, signature: str) -> bool:
    """Verify GitHub webhook signature"""
    if not settings.github_webhook_secret:
        logger.warning("GitHub webhook secret not configured, skipping signature verification")
        return True
    
    expected_signature = hmac.new(
        settings.github_webhook_secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(f"sha256={expected_signature}", signature)


@router.post("/github")
async def github_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle GitHub webhook events"""
    try:
        # Get the raw payload
        payload = await request.body()
        
        # Verify signature
        signature = request.headers.get("X-Hub-Signature-256", "")
        if not verify_github_signature(payload, signature):
            raise HTTPException(status_code=403, detail="Invalid signature")
        
        # Parse the payload
        try:
            event_data = json.loads(payload.decode())
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON payload")
        
        # Get event type
        event_type = request.headers.get("X-GitHub-Event", "")
        
        # Only process push events for now
        if event_type == "push":
            repository = event_data.get("repository", {})
            owner = repository.get("owner", {}).get("login")
            repo_name = repository.get("name")
            
            if owner and repo_name:
                # Find the project in our database
                service = ProjectService(db)
                projects = service.get_projects(limit=1000, offset=0)  # Get all projects
                
                for project in projects["projects"]:
                    if project.owner == owner and project.name == repo_name:
                        # Queue for refresh
                        service.queue_refresh(str(project.id))
                        logger.info(f"Queued project {owner}/{repo_name} for refresh due to push event")
                        break
        
        return {"status": "ok"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook processing failed: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")