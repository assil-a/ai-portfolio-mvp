from fastapi import APIRouter
from ..schemas import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/healthz", response_model=HealthResponse)
def health_check():
    """Health check endpoint"""
    return HealthResponse(status="ok")