import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock
from app.main import app

client = TestClient(app)


class TestHealthEndpoint:
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/healthz")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class TestProjectsEndpoint:
    @patch('app.routers.projects.get_db')
    def test_get_projects_empty(self, mock_get_db):
        """Test getting projects when none exist"""
        mock_db = Mock()
        mock_db.query.return_value.offset.return_value.limit.return_value.all.return_value = []
        mock_db.query.return_value.count.return_value = 0
        mock_get_db.return_value = mock_db
        
        response = client.get("/projects")
        assert response.status_code == 200
        data = response.json()
        assert data["projects"] == []
        assert data["total"] == 0
        assert data["limit"] == 50
        assert data["offset"] == 0
    
    @patch('app.routers.projects.get_db')
    @patch('app.services.github_client.GitHubClient.parse_repo_url')
    @patch('app.services.project_service.ProjectService.create_project')
    def test_create_project_success(self, mock_create, mock_parse, mock_get_db):
        """Test successful project creation"""
        mock_parse.return_value = ("owner", "repo")
        mock_project = Mock()
        mock_project.id = "test-id"
        mock_project.owner = "owner"
        mock_project.name = "repo"
        mock_project.html_url = "https://github.com/owner/repo"
        mock_project.default_branch = "main"
        mock_project.visibility = "public"
        mock_project.last_commit_at = None
        mock_project.last_actor = None
        mock_project.active_contributors_90d = 0
        mock_project.install_status = "none"
        mock_project.created_at = "2024-01-01T00:00:00Z"
        mock_project.updated_at = "2024-01-01T00:00:00Z"
        
        mock_create.return_value = mock_project
        mock_get_db.return_value = Mock()
        
        response = client.post("/projects", json={"repo_url": "https://github.com/owner/repo"})
        assert response.status_code == 200
        data = response.json()
        assert data["owner"] == "owner"
        assert data["name"] == "repo"
    
    def test_create_project_invalid_url(self):
        """Test project creation with invalid URL"""
        response = client.post("/projects", json={"repo_url": "invalid-url"})
        assert response.status_code == 400