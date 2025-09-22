# API Documentation

## Base URL

```
http://localhost:43619
```

## Authentication

The API uses GitHub App or OAuth tokens for GitHub API access. No authentication is required for the public endpoints.

## Endpoints

### Health Check

#### GET /healthz

Check the health status of the API.

**Response:**
```json
{
  "status": "ok"
}
```

### Projects

#### GET /projects

Retrieve a list of projects with pagination and sorting.

**Query Parameters:**
- `order` (string, optional): Sort order. Format: `{field}_{direction}`. Default: `last_activity_at_desc`
  - Fields: `last_activity_at`, `created_at`, `updated_at`
  - Directions: `asc`, `desc`
- `limit` (integer, optional): Number of projects to return. Default: `50`, Max: `100`
- `offset` (integer, optional): Number of projects to skip. Default: `0`

**Response:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "owner": "string",
      "name": "string",
      "html_url": "string",
      "default_branch": "string|null",
      "visibility": "public|private",
      "last_commit_at": "ISO8601|null",
      "last_actor": "string|null",
      "active_contributors_90d": 0,
      "install_status": "app|oauth|none",
      "created_at": "ISO8601",
      "updated_at": "ISO8601"
    }
  ],
  "total": 0,
  "limit": 50,
  "offset": 0
}
```

#### POST /projects

Add a new repository to the portfolio.

**Request Body:**
```json
{
  "repo_url": "https://github.com/owner/repo"
}
```

**Response:**
```json
{
  "id": "uuid",
  "owner": "string",
  "name": "string",
  "html_url": "string",
  "default_branch": "string|null",
  "visibility": "public|private",
  "last_commit_at": "ISO8601|null",
  "last_actor": "string|null",
  "active_contributors_90d": 0,
  "install_status": "app|oauth|none",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid repository URL
- `403 Forbidden`: Repository access denied (returns install URL if available)
- `404 Not Found`: Repository not found
- `409 Conflict`: Repository already exists

#### GET /projects/{id}

Get detailed information about a specific project.

**Path Parameters:**
- `id` (string): Project UUID

**Response:**
```json
{
  "id": "uuid",
  "owner": "string",
  "name": "string",
  "html_url": "string",
  "default_branch": "string|null",
  "visibility": "public|private",
  "last_commit_at": "ISO8601|null",
  "last_actor": "string|null",
  "active_contributors_90d": 0,
  "install_status": "app|oauth|none",
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "contributors_90d": [
    {
      "login": "string",
      "commits": 0,
      "last_commit_at": "ISO8601|null"
    }
  ],
  "last_open_pr": {
    "number": 0,
    "updated_at": "ISO8601",
    "author": "string"
  } | null,
  "default_branch_ref": "string"
}
```

**Error Responses:**
- `404 Not Found`: Project not found

#### POST /projects/{id}/refresh

Refresh project data from GitHub.

**Path Parameters:**
- `id` (string): Project UUID

**Response:**
```json
{
  "id": "uuid",
  "owner": "string",
  "name": "string",
  "html_url": "string",
  "default_branch": "string|null",
  "visibility": "public|private",
  "last_commit_at": "ISO8601|null",
  "last_actor": "string|null",
  "active_contributors_90d": 0,
  "install_status": "app|oauth|none",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

**Error Responses:**
- `404 Not Found`: Project not found
- `403 Forbidden`: GitHub access denied
- `429 Too Many Requests`: Rate limit exceeded

### Webhooks

#### POST /webhooks/github

GitHub webhook handler for automatic project updates.

**Headers:**
- `X-GitHub-Event`: Event type
- `X-Hub-Signature-256`: Webhook signature

**Request Body:**
GitHub webhook payload (varies by event type)

**Response:**
```json
{
  "status": "ok"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid signature or payload
- `422 Unprocessable Entity`: Unsupported event type

## Error Handling

All endpoints return consistent error responses:

```json
{
  "detail": "Error message",
  "error_code": "ERROR_CODE",
  "timestamp": "ISO8601"
}
```

### Common Error Codes

- `INVALID_REPO_URL`: Repository URL format is invalid
- `REPO_NOT_FOUND`: Repository does not exist
- `REPO_ACCESS_DENIED`: No access to repository
- `REPO_ALREADY_EXISTS`: Repository already in portfolio
- `GITHUB_API_ERROR`: GitHub API returned an error
- `RATE_LIMIT_EXCEEDED`: GitHub API rate limit exceeded
- `INTERNAL_ERROR`: Internal server error

## Rate Limiting

The API respects GitHub's rate limits:

- **GitHub App**: 5,000 requests per hour per installation
- **OAuth**: 5,000 requests per hour per user
- **Unauthenticated**: 60 requests per hour per IP

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1640995200
```

## Data Models

### Project

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique project identifier |
| `owner` | string | Repository owner/organization |
| `name` | string | Repository name |
| `html_url` | string | GitHub repository URL |
| `default_branch` | string? | Default branch name |
| `visibility` | string | Repository visibility (public/private) |
| `last_commit_at` | datetime? | Timestamp of last commit |
| `last_actor` | string? | Username of last committer |
| `active_contributors_90d` | integer | Number of active contributors in last 90 days |
| `install_status` | string | GitHub integration status (app/oauth/none) |
| `created_at` | datetime | Project creation timestamp |
| `updated_at` | datetime | Last update timestamp |

### Contributor

| Field | Type | Description |
|-------|------|-------------|
| `login` | string | GitHub username |
| `commits` | integer | Number of commits in time window |
| `last_commit_at` | datetime? | Timestamp of last commit |

### Pull Request

| Field | Type | Description |
|-------|------|-------------|
| `number` | integer | Pull request number |
| `updated_at` | datetime | Last update timestamp |
| `author` | string | Pull request author username |

## Examples

### Add Repository

```bash
curl -X POST "http://localhost:43619/projects" \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/facebook/react"}'
```

### List Projects

```bash
curl "http://localhost:43619/projects?order=last_activity_at_desc&limit=10"
```

### Get Project Details

```bash
curl "http://localhost:43619/projects/550e8400-e29b-41d4-a716-446655440000"
```

### Refresh Project

```bash
curl -X POST "http://localhost:43619/projects/550e8400-e29b-41d4-a716-446655440000/refresh"
```

## GraphQL Query

The API uses this GraphQL query to fetch repository data:

```graphql
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
                user { login }
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
        author { login }
      }
    }
  }
}
```