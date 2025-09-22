# AI Portfolio Console - Project Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AI Portfolio Console                              │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: User adds a GitHub repository
┌─────────────┐    paste URL    ┌─────────────┐
│    User     │ ──────────────► │  Web App    │
│             │                 │ (React)     │
└─────────────┘                 └─────────────┘
                                       │
                                       │ POST /projects
                                       ▼
Step 2: Frontend sends request to backend
                                ┌─────────────┐
                                │   Backend   │
                                │  (FastAPI)  │
                                └─────────────┘
                                       │
                                       │ fetch repo data
                                       ▼
Step 3: Backend calls GitHub API
                                ┌─────────────┐
                                │ GitHub API  │
                                │             │
                                └─────────────┘
                                       │
                                       │ return repo info
                                       ▼
Step 4: Backend processes and stores data
                                ┌─────────────┐
                                │   Backend   │
                                │  (FastAPI)  │
                                └─────────────┘
                                       │
                                       │ save to database
                                       ▼
                                ┌─────────────┐
                                │  Database   │
                                │(PostgreSQL) │
                                └─────────────┘
                                       │
                                       │ return saved data
                                       ▼
Step 5: Data flows back to user
                                ┌─────────────┐
                                │   Backend   │
                                │  (FastAPI)  │
                                └─────────────┘
                                       │
                                       │ JSON response
                                       ▼
                                ┌─────────────┐
                                │  Web App    │
                                │ (React)     │
                                └─────────────┘
                                       │
                                       │ display in table
                                       ▼
┌─────────────┐                 ┌─────────────┐
│    User     │ ◄─────────────── │  Web App    │
│             │   sees results   │ (React)     │
└─────────────┘                 └─────────────┘
```

## Data Flow Example

### Input:
```
User pastes: https://github.com/facebook/react
```

### Processing:
```
1. Frontend → Backend: POST /projects {"repo_url": "https://github.com/facebook/react"}
2. Backend → GitHub: GraphQL query for repository data
3. GitHub → Backend: Repository metadata + commit history
4. Backend → Database: Store processed data
5. Database → Backend: Confirm storage
6. Backend → Frontend: Return project data
7. Frontend → User: Display in portfolio table
```

### Output:
```
Portfolio Table shows:
┌─────────────────┬─────────────────┬─────────────┬─────────────┐
│ Repository      │ Last Activity   │ Contributors│ Branch      │
├─────────────────┼─────────────────┼─────────────┼─────────────┤
│ facebook/react  │ 2 hours ago     │ 23 (90d)    │ main        │
└─────────────────┴─────────────────┴─────────────┴─────────────┘
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ProjectsTable│  │AddRepoModal │  │ProjectDetail│            │
│  │             │  │             │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                 │                 │                 │
│         └─────────────────┼─────────────────┘                 │
│                           │                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              API Client (Axios)                        │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │ HTTP Requests
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend (FastAPI)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Projects  │  │   Health    │  │  Webhooks   │            │
│  │   Router    │  │   Router    │  │   Router    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                 │                 │                 │
│         └─────────────────┼─────────────────┘                 │
│                           │                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Project Service                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              GitHub Client                             │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │ GraphQL/REST
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub API                              │
└─────────────────────────────────────────────────────────────────┘
                            │ Store Results
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  projects   │  │project_     │  │project_     │            │
│  │   table     │  │contributors │  │refresh_queue│            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## User Journey

### 1. First Time User
```
Visit App → See Empty Dashboard → Click "Add Repository" → 
Paste GitHub URL → Submit → See Repository in Table → 
Click "View" → See Detailed Information
```

### 2. Regular User
```
Visit App → See Portfolio Table → Search for Specific Repo → 
Click "Refresh" to Update → Sort by Last Activity → 
Monitor Team Activity
```

### 3. Team Lead
```
Visit App → Add Multiple Team Repositories → 
Monitor Contributor Activity → Identify Inactive Projects → 
Track Development Velocity → Generate Reports
```

## API Request/Response Flow

### Adding a Repository

**Request:**
```http
POST /projects
Content-Type: application/json

{
  "repo_url": "https://github.com/owner/repo"
}
```

**Backend Processing:**
1. Parse URL to extract owner/repo
2. Resolve authentication (GitHub App → OAuth → Error)
3. Query GitHub GraphQL API
4. Process commit history for 90-day window
5. Count unique contributors
6. Store in database
7. Return formatted response

**Response:**
```json
{
  "id": "uuid-here",
  "owner": "owner",
  "name": "repo",
  "html_url": "https://github.com/owner/repo",
  "default_branch": "main",
  "visibility": "public",
  "last_commit_at": "2024-01-15T10:30:00Z",
  "last_actor": "contributor-name",
  "active_contributors_90d": 5,
  "install_status": "app",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

## Error Handling Flow

```
User Input → Validation → GitHub API Call
     │            │              │
     ▼            ▼              ▼
Invalid URL   Missing Repo   Rate Limited
     │            │              │
     ▼            ▼              ▼
Show Error   Show 404 Error  Retry with Backoff
     │            │              │
     ▼            ▼              ▼
User Fixes   User Checks URL  Eventually Succeeds
```

## Security Flow

```
User Request → Input Validation → Authentication Check → 
Rate Limiting → GitHub API Call → Data Sanitization → 
Database Storage → Response Filtering → User Response
```

Each step includes security measures:
- Input validation prevents injection attacks
- Authentication ensures proper access
- Rate limiting prevents abuse
- Data sanitization prevents XSS
- Response filtering prevents data leakage

This visual representation helps understand how all the components work together to create a seamless user experience while maintaining security and reliability.