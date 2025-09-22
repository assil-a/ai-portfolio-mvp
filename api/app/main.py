from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import projects_router, health_router, webhooks_router
from .core.config import settings
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='{"timestamp": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s", "module": "%(name)s"}'
)

app = FastAPI(
    title="AI Portfolio Console API",
    description="API for managing GitHub repository portfolio",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(projects_router)
app.include_router(webhooks_router)


@app.get("/")
def root():
    return {"message": "AI Portfolio Console API", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.port)