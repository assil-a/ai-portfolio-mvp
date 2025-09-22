import httpx
import jwt
import time
import re
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timedelta
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)


class GitHubClient:
    def __init__(self):
        self.base_url = "https://api.github.com"
        self.graphql_url = "https://api.github.com/graphql"
        
    def _generate_jwt_token(self) -> Optional[str]:
        """Generate JWT token for GitHub App authentication"""
        if not settings.github_app_id or not settings.github_app_private_key:
            return None
            
        now = int(time.time())
        payload = {
            'iat': now - 60,  # Issued at time, 60 seconds in the past
            'exp': now + (10 * 60),  # JWT expiration time (10 minutes maximum)
            'iss': settings.github_app_id  # GitHub App's identifier
        }
        
        try:
            return jwt.encode(payload, settings.github_app_private_key, algorithm='RS256')
        except Exception as e:
            logger.error(f"Failed to generate JWT token: {e}")
            return None
    
    async def _get_installation_token(self, owner: str, repo: str) -> Optional[str]:
        """Get installation access token for a specific repository"""
        jwt_token = self._generate_jwt_token()
        if not jwt_token:
            return None
            
        headers = {
            "Authorization": f"Bearer {jwt_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                # Get installation for the repository
                response = await client.get(
                    f"{self.base_url}/repos/{owner}/{repo}/installation",
                    headers=headers
                )
                
                if response.status_code != 200:
                    logger.warning(f"No installation found for {owner}/{repo}: {response.status_code}")
                    return None
                
                installation_id = response.json()["id"]
                
                # Get access token for the installation
                response = await client.post(
                    f"{self.base_url}/app/installations/{installation_id}/access_tokens",
                    headers=headers
                )
                
                if response.status_code == 201:
                    return response.json()["token"]
                else:
                    logger.error(f"Failed to get installation token: {response.status_code}")
                    return None
                    
            except Exception as e:
                logger.error(f"Error getting installation token: {e}")
                return None
    
    def _parse_github_url(self, repo_url: str) -> Tuple[str, str]:
        """Parse GitHub URL to extract owner and repo name"""
        # Remove trailing slash and .git if present
        url = repo_url.rstrip('/').rstrip('.git')
        
        # Extract owner and repo from URL
        match = re.match(r'https://github\.com/([^/]+)/([^/]+)', url)
        if not match:
            raise ValueError(f"Invalid GitHub URL: {repo_url}")
        
        return match.group(1), match.group(2)
    
    async def resolve_token(self, owner: str, repo: str) -> Tuple[Optional[str], str]:
        """
        Resolve the best available token for accessing a repository.
        Returns (token, install_status) where install_status is 'app', 'oauth', or 'none'
        """
        # Try GitHub App installation token first
        app_token = await self._get_installation_token(owner, repo)
        if app_token:
            return app_token, 'app'
        
        # Fallback to OAuth token if available
        if settings.oauth_github_client_id and settings.oauth_github_client_secret:
            # In a real implementation, you'd get the OAuth token from user session
            # For now, we'll return None and suggest installation
            pass
        
        return None, 'none'
    
    async def get_repository_activity_graphql(self, owner: str, repo: str, token: str, since: datetime) -> Dict[str, Any]:
        """Fetch repository activity using GraphQL API"""
        query = """
        query RepoActivity($owner: String!, $name: String!, $since: GitTimestamp!) {
          repository(owner: $owner, name: $name) {
            nameWithOwner
            isPrivate
            url
            defaultBranchRef {
              name
              target {
                ... on Commit {
                  committedDate
                  history(since: $since, first: 100) {
                    nodes {
                      committedDate
                      author {
                        user {
                          login
                        }
                        email
                        name
                      }
                    }
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                  }
                }
              }
            }
            pullRequests(states: OPEN, first: 1, orderBy: {field: UPDATED_AT, direction: DESC}) {
              nodes {
                number
                updatedAt
                author {
                  login
                }
              }
            }
          }
        }
        """
        
        variables = {
            "owner": owner,
            "name": repo,
            "since": since.isoformat()
        }
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.graphql_url,
                json={"query": query, "variables": variables},
                headers=headers
            )
            
            if response.status_code != 200:
                raise Exception(f"GraphQL request failed: {response.status_code}")
            
            data = response.json()
            if "errors" in data:
                raise Exception(f"GraphQL errors: {data['errors']}")
            
            return data["data"]["repository"]
    
    async def get_repository_basic_info(self, owner: str, repo: str, token: str) -> Dict[str, Any]:
        """Fallback REST API call to get basic repository information"""
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        async with httpx.AsyncClient() as client:
            # Get repository info
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}",
                headers=headers
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to fetch repository: {response.status_code}")
            
            repo_data = response.json()
            
            # Get latest commit from default branch
            default_branch = repo_data["default_branch"]
            commits_response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/commits",
                headers=headers,
                params={"sha": default_branch, "per_page": 1}
            )
            
            latest_commit = None
            if commits_response.status_code == 200:
                commits = commits_response.json()
                if commits:
                    latest_commit = commits[0]
            
            return {
                "nameWithOwner": repo_data["full_name"],
                "isPrivate": repo_data["private"],
                "url": repo_data["html_url"],
                "defaultBranchRef": {
                    "name": default_branch
                },
                "latestCommit": latest_commit
            }
    
    async def fetch_repository_data(self, repo_url: str) -> Dict[str, Any]:
        """Main method to fetch repository data with token resolution"""
        owner, repo = self._parse_github_url(repo_url)
        
        # Check if organization is allowed
        if settings.allowed_orgs_list and owner not in settings.allowed_orgs_list:
            raise Exception(f"Organization '{owner}' is not in the allowed list")
        
        token, install_status = await self.resolve_token(owner, repo)
        
        if not token:
            install_url = f"https://github.com/apps/your-app-name/installations/new/permissions?target_id={owner}"
            raise Exception(f"No access token available. Install the GitHub App: {install_url}")
        
        try:
            # Try GraphQL first for comprehensive data
            since = datetime.now() - timedelta(days=settings.contributor_window_days)
            repo_data = await self.get_repository_activity_graphql(owner, repo, token, since)
            
            # Process contributor data
            contributors = {}
            if repo_data.get("defaultBranchRef") and repo_data["defaultBranchRef"].get("target"):
                history = repo_data["defaultBranchRef"]["target"].get("history", {})
                for commit in history.get("nodes", []):
                    author = commit.get("author", {})
                    user = author.get("user")
                    login = user.get("login") if user else author.get("email", "unknown")
                    
                    if login not in contributors:
                        contributors[login] = {
                            "login": login,
                            "commits": 0,
                            "last_commit_at": None
                        }
                    
                    contributors[login]["commits"] += 1
                    commit_date = datetime.fromisoformat(commit["committedDate"].replace('Z', '+00:00'))
                    if not contributors[login]["last_commit_at"] or commit_date > contributors[login]["last_commit_at"]:
                        contributors[login]["last_commit_at"] = commit_date
            
            # Get last open PR
            last_open_pr = None
            if repo_data.get("pullRequests", {}).get("nodes"):
                pr = repo_data["pullRequests"]["nodes"][0]
                last_open_pr = {
                    "number": pr["number"],
                    "updated_at": datetime.fromisoformat(pr["updatedAt"].replace('Z', '+00:00')),
                    "author": pr["author"]["login"] if pr["author"] else "unknown"
                }
            
            # Get last commit info
            last_commit_at = None
            last_actor = None
            if repo_data.get("defaultBranchRef") and repo_data["defaultBranchRef"].get("target"):
                target = repo_data["defaultBranchRef"]["target"]
                last_commit_at = datetime.fromisoformat(target["committedDate"].replace('Z', '+00:00'))
                history = target.get("history", {})
                if history.get("nodes"):
                    latest_commit = history["nodes"][0]
                    author = latest_commit.get("author", {})
                    user = author.get("user")
                    last_actor = user.get("login") if user else author.get("email", "unknown")
            
            return {
                "owner": owner,
                "name": repo,
                "html_url": repo_data["url"],
                "default_branch": repo_data.get("defaultBranchRef", {}).get("name"),
                "visibility": "private" if repo_data["isPrivate"] else "public",
                "last_commit_at": last_commit_at,
                "last_actor": last_actor,
                "install_status": install_status,
                "contributors": list(contributors.values()),
                "last_open_pr": last_open_pr
            }
            
        except Exception as e:
            logger.warning(f"GraphQL failed, falling back to REST API: {e}")
            # Fallback to REST API
            repo_data = await self.get_repository_basic_info(owner, repo, token)
            
            last_commit_at = None
            last_actor = None
            if repo_data.get("latestCommit"):
                commit = repo_data["latestCommit"]
                last_commit_at = datetime.fromisoformat(commit["commit"]["committer"]["date"].replace('Z', '+00:00'))
                last_actor = commit.get("author", {}).get("login", "unknown")
            
            return {
                "owner": owner,
                "name": repo,
                "html_url": repo_data["url"],
                "default_branch": repo_data.get("defaultBranchRef", {}).get("name"),
                "visibility": "private" if repo_data["isPrivate"] else "public",
                "last_commit_at": last_commit_at,
                "last_actor": last_actor,
                "install_status": install_status,
                "contributors": [],  # Limited data in REST fallback
                "last_open_pr": None
            }