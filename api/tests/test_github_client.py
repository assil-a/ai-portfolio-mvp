import pytest
from unittest.mock import Mock, patch
from app.services.github_client import GitHubClient, GitHubError


class TestGitHubClient:
    def test_parse_repo_url_valid(self):
        """Test parsing valid GitHub URLs"""
        client = GitHubClient()
        
        test_cases = [
            ("https://github.com/owner/repo", ("owner", "repo")),
            ("https://github.com/owner/repo.git", ("owner", "repo")),
            ("https://github.com/owner/repo/", ("owner", "repo")),
            ("git@github.com:owner/repo.git", ("owner", "repo")),
        ]
        
        for url, expected in test_cases:
            result = client.parse_repo_url(url)
            assert result == expected, f"Failed for URL: {url}"
    
    def test_parse_repo_url_invalid(self):
        """Test parsing invalid URLs"""
        client = GitHubClient()
        
        invalid_urls = [
            "https://gitlab.com/owner/repo",
            "https://github.com/owner",
            "not-a-url",
            "",
            "https://github.com/",
        ]
        
        for url in invalid_urls:
            with pytest.raises(ValueError):
                client.parse_repo_url(url)
    
    @patch('httpx.AsyncClient.get')
    async def test_get_repo_info_success(self, mock_get):
        """Test successful repository info retrieval"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "name": "test-repo",
            "owner": {"login": "test-owner"},
            "html_url": "https://github.com/test-owner/test-repo",
            "default_branch": "main",
            "private": False,
        }
        mock_get.return_value = mock_response
        
        client = GitHubClient()
        result = await client.get_repo_info("test-owner", "test-repo")
        
        assert result["name"] == "test-repo"
        assert result["owner"]["login"] == "test-owner"
        assert result["default_branch"] == "main"
        assert result["private"] is False
    
    @patch('httpx.AsyncClient.get')
    async def test_get_repo_info_not_found(self, mock_get):
        """Test repository not found"""
        mock_response = Mock()
        mock_response.status_code = 404
        mock_response.json.return_value = {"message": "Not Found"}
        mock_get.return_value = mock_response
        
        client = GitHubClient()
        
        with pytest.raises(GitHubError) as exc_info:
            await client.get_repo_info("nonexistent", "repo")
        
        assert exc_info.value.status_code == 404
    
    def test_resolve_token_priority(self):
        """Test token resolution priority (App > OAuth > None)"""
        client = GitHubClient()
        
        # Mock methods
        client._get_installation_token = Mock(return_value="app_token")
        client._get_oauth_token = Mock(return_value="oauth_token")
        
        # Test App token priority
        token = client.resolve_token("owner", "repo")
        assert token == "app_token"
        
        # Test OAuth fallback when App fails
        client._get_installation_token = Mock(return_value=None)
        token = client.resolve_token("owner", "repo")
        assert token == "oauth_token"
        
        # Test None when both fail
        client._get_oauth_token = Mock(return_value=None)
        token = client.resolve_token("owner", "repo")
        assert token is None