# AI Portfolio Console - Simple Explanation

## What is this project?

The AI Portfolio Console is a **web application that helps you track and monitor GitHub repositories**. Think of it as a dashboard where you can see all your GitHub projects in one place with useful information about their activity.

## What does it do?

### Main Features:
1. **Add GitHub repositories** by pasting their URLs
2. **See when each project was last updated** (last commit)
3. **Count how many people worked on each project** in the last 90 days
4. **View project details** like contributors and recent activity
5. **Refresh data** to get the latest information

### Simple Example:
- You paste `https://github.com/facebook/react` 
- The app shows you:
  - Last updated: "2 hours ago"
  - Active contributors: "15 people in last 90 days"
  - Default branch: "main"
  - Visibility: "Public"

## How is it built?

The project has **3 main parts**:

### 1. Frontend (What you see) 🖥️
- **Technology**: React (JavaScript framework)
- **What it does**: Shows a nice web page with tables and buttons
- **Features**: 
  - Table showing all your repositories
  - Search box to find specific repos
  - "Add Repository" button
  - Detail view when you click on a project

### 2. Backend (The brain) 🧠
- **Technology**: FastAPI (Python framework)
- **What it does**: Handles requests and talks to GitHub
- **Features**:
  - Connects to GitHub to get repository information
  - Stores data in a database
  - Provides API endpoints for the frontend

### 3. Database (Memory) 💾
- **Technology**: PostgreSQL
- **What it does**: Remembers all the repository information
- **Stores**:
  - Repository names and URLs
  - Last commit dates
  - Contributor information
  - Activity data

## How do the parts work together?

```
You → Frontend → Backend → GitHub API
                    ↓
                 Database
```

1. **You** type a GitHub URL in the web page
2. **Frontend** sends this to the backend
3. **Backend** asks GitHub for information about that repository
4. **Backend** saves the information in the database
5. **Frontend** shows you the information in a nice table

## What can you do with it?

### As a Developer:
- Track all your personal projects
- See which projects are most active
- Monitor contributor activity
- Keep tabs on open source projects you care about

### As a Team Lead:
- Monitor team repositories
- See who's been contributing to what
- Track project activity across your organization
- Get insights into development patterns

### As a Project Manager:
- Overview of all company repositories
- Track development activity
- Monitor project health
- Generate reports on team productivity

## Key Benefits:

### 🎯 **Centralized View**
Instead of visiting each GitHub repository individually, see everything in one dashboard.

### 📊 **Activity Insights**
Quickly identify which projects are active and which might need attention.

### 👥 **Team Visibility**
See who's contributing to what projects and how active they are.

### 🔄 **Real-time Updates**
Refresh data to get the latest information from GitHub.

### 🔒 **Secure**
Only reads public information or repositories you have access to - never makes changes.

## How to use it?

### Step 1: Start the application
```bash
cd ops
make dev
```

### Step 2: Open your browser
Go to `http://localhost:45937`

### Step 3: Add repositories
1. Click "Add Repository"
2. Paste a GitHub URL like `https://github.com/owner/repo-name`
3. Click "Add"

### Step 4: View your dashboard
- See all repositories in a table
- Sort by last activity
- Search for specific repositories
- Click "View" to see details

## What makes it special?

### 🚀 **Easy to Deploy**
Everything runs with Docker - just one command to start.

### 🔧 **Configurable**
Works with GitHub Apps or personal tokens.

### 📱 **Modern Interface**
Clean, responsive design that works on desktop and mobile.

### 🛡️ **Secure by Design**
No secrets in code, comprehensive security measures.

### 🧪 **Well Tested**
Includes automated tests to ensure everything works.

## Real-world Example:

Imagine you're managing 10 different GitHub repositories for your company:

**Before this tool:**
- Visit each repository individually
- Manually check last commit dates
- Count contributors by looking at commit history
- No easy way to get an overview

**With this tool:**
- See all 10 repositories in one table
- Instantly see which ones were updated recently
- Know how many people worked on each project
- Sort by activity to prioritize your attention
- Get detailed contributor information with one click

## Technical Architecture (Simplified):

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │   FastAPI       │    │   PostgreSQL    │
│   (React App)   │◄──►│   (Python API)  │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   GitHub API    │
                       │   (Data Source) │
                       └─────────────────┘
```

## File Structure (Simplified):

```
ai-portfolio-console/
├── web/          # Frontend (React)
│   ├── src/      # Source code
│   └── public/   # Static files
├── api/          # Backend (Python)
│   ├── app/      # Application code
│   └── tests/    # Tests
├── ops/          # Deployment
│   ├── docker-compose.yml
│   └── Makefile
└── docs/         # Documentation
```

## Summary:

The AI Portfolio Console is like having a **personal assistant for your GitHub repositories**. Instead of manually checking each repository for updates and activity, you get a beautiful dashboard that shows you everything at a glance. It's built with modern web technologies, is secure by design, and easy to deploy with Docker.

Perfect for developers, team leads, and project managers who want to stay on top of their GitHub activity without the manual work!

---

## Want More Details?

- 📋 **Technical Details**: See the main [README.md](README.md)
- 🔄 **Project Flow**: Check out [PROJECT_FLOW.md](docs/PROJECT_FLOW.md) for visual diagrams
- 🔒 **Security**: Read [SECURITY.md](docs/SECURITY.md) for security measures
- 📚 **API Documentation**: View [API.md](docs/API.md) for endpoint details