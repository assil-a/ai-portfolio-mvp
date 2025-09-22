# Configuration Guide - AI Portfolio Console

## Quick Start Configuration

### Prerequisites

Before you begin, make sure you have:
- **Docker** and **Docker Compose** installed
- A **GitHub account**
- **Git** installed on your machine

### Step 1: Clone and Setup

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd ai-portfolio-console

# Navigate to operations directory
cd ops
```

### Step 2: Create Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit the configuration file
nano .env  # or use your preferred editor
```

### Step 3: Configure GitHub Access

You have **two options** for GitHub integration:

## Option A: GitHub Personal Access Token (Easiest)

### 1. Create a Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "AI Portfolio Console"
4. Select these scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `public_repo` (Access public repositories)
   - ✅ `read:user` (Read user profile data)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

### 2. Configure Environment Variables

Edit your `.env` file:

```bash
# GitHub OAuth Configuration (Personal Token Method)
OAUTH_GITHUB_CLIENT_ID=your_github_username
OAUTH_GITHUB_CLIENT_SECRET=ghp_your_personal_access_token_here

# Leave GitHub App settings empty for now
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=

# Database (use default for local development)
DATABASE_URL=postgresql://portfolio_user:portfolio_pass@db:5432/portfolio_db

# API Configuration
PORT=43619
CONTRIBUTOR_WINDOW_DAYS=90

# Admin Access (optional)
ADMIN_BASIC_AUTH_USER=admin
ADMIN_BASIC_AUTH_PASS=your_secure_password

# Organization Filter (optional - leave empty to allow all)
ALLOWED_ORGS=
```

## Option B: GitHub App (Recommended for Production)

### 1. Create a GitHub App

1. Go to GitHub → Settings → Developer settings → GitHub Apps
2. Click "New GitHub App"
3. Fill in the details:
   - **App name**: "AI Portfolio Console"
   - **Homepage URL**: `http://localhost:45937`
   - **Webhook URL**: `http://localhost:43619/webhooks/github` (optional)
   - **Repository permissions**:
     - Contents: Read
     - Metadata: Read
     - Pull requests: Read
   - **User permissions**: None needed
4. Click "Create GitHub App"

### 2. Generate and Download Private Key

1. In your new GitHub App settings
2. Scroll down to "Private keys"
3. Click "Generate a private key"
4. Download the `.pem` file
5. Move it to your project: `mv ~/Downloads/your-app.pem ops/github-app-private-key.pem`

### 3. Install the App

1. In GitHub App settings, click "Install App"
2. Choose your account or organization
3. Select repositories you want to monitor
4. Note the Installation ID from the URL

### 4. Configure Environment Variables

Edit your `.env` file:

```bash
# GitHub App Configuration
GITHUB_APP_ID=123456  # Your app ID
GITHUB_APP_PRIVATE_KEY_PATH=./github-app-private-key.pem
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here

# Leave OAuth empty when using GitHub App
OAUTH_GITHUB_CLIENT_ID=
OAUTH_GITHUB_CLIENT_SECRET=

# Database
DATABASE_URL=postgresql://portfolio_user:portfolio_pass@db:5432/portfolio_db

# API Configuration
PORT=43619
CONTRIBUTOR_WINDOW_DAYS=90

# Admin Access
ADMIN_BASIC_AUTH_USER=admin
ADMIN_BASIC_AUTH_PASS=your_secure_password

# Organization Filter (optional)
ALLOWED_ORGS=your-org-name,another-org
```

## Complete Environment File Example

Here's a complete `.env` file for **Personal Access Token** setup:

```bash
# ===========================================
# AI Portfolio Console Configuration
# ===========================================

# GitHub OAuth Configuration (Personal Token Method)
OAUTH_GITHUB_CLIENT_ID=your_github_username
OAUTH_GITHUB_CLIENT_SECRET=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# GitHub App Configuration (leave empty for OAuth)
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=

# Database Configuration
DATABASE_URL=postgresql://portfolio_user:portfolio_pass@db:5432/portfolio_db

# API Server Configuration
PORT=43619
CONTRIBUTOR_WINDOW_DAYS=90

# Admin Authentication (optional)
ADMIN_BASIC_AUTH_USER=admin
ADMIN_BASIC_AUTH_PASS=MySecurePassword123!

# Security Configuration
ALLOWED_ORGS=
CORS_ORIGINS=http://localhost:45937,http://localhost:3000

# Logging
LOG_LEVEL=info
```

## Step 4: Start the Application

```bash
# Make sure you're in the ops directory
cd ops

# Start all services
make dev

# Or manually with docker-compose
docker-compose up --build
```

### Expected Output:
```
✅ Database container started
✅ API container started  
✅ Web container started
✅ All services healthy
```

## Step 5: Access the Application

1. **Web Interface**: http://localhost:45937
2. **API Documentation**: http://localhost:43619/docs
3. **Health Check**: http://localhost:43619/healthz

## Step 6: Test with Your Repositories

### Test with Public Repository:
1. Open http://localhost:45937
2. Click "Add Repository"
3. Paste: `https://github.com/facebook/react`
4. Click "Add"
5. You should see the repository appear in the table

### Test with Your Own Repository:
1. Click "Add Repository"
2. Paste your repo URL: `https://github.com/yourusername/your-repo`
3. Click "Add"
4. Verify it shows your recent commits and contributors

## Troubleshooting

### Common Issues and Solutions

#### 1. "Authentication failed" Error
**Problem**: GitHub token is invalid or expired
**Solution**: 
- Check your personal access token is correct
- Ensure token has proper scopes (`repo`, `public_repo`)
- Generate a new token if needed

#### 2. "Repository not found" Error
**Problem**: Repository is private and token lacks access
**Solution**:
- Ensure your token has `repo` scope for private repositories
- Check if you have access to the repository

#### 3. "Rate limit exceeded" Error
**Problem**: Too many API requests to GitHub
**Solution**:
- Wait for rate limit to reset (usually 1 hour)
- Use GitHub App instead of personal token (higher limits)

#### 4. Database Connection Error
**Problem**: PostgreSQL container not running
**Solution**:
```bash
# Check container status
docker-compose ps

# Restart database
docker-compose restart db

# Check logs
docker-compose logs db
```

#### 5. Port Already in Use
**Problem**: Ports 43619 or 45937 are occupied
**Solution**:
```bash
# Check what's using the port
lsof -i :43619
lsof -i :45937

# Kill the process or change ports in docker-compose.yml
```

### Debug Commands

```bash
# Check all container status
make status

# View logs for all services
make logs

# View logs for specific service
docker-compose logs api
docker-compose logs web
docker-compose logs db

# Run security check
make security-check

# Test API directly
curl http://localhost:43619/healthz

# Access database directly
docker-compose exec db psql -U portfolio_user -d portfolio_db
```

## Testing Your Setup

### 1. Health Check Test
```bash
curl http://localhost:43619/healthz
# Expected: {"status": "ok"}
```

### 2. Add Repository Test
```bash
curl -X POST http://localhost:43619/projects \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/facebook/react"}'
```

### 3. List Projects Test
```bash
curl http://localhost:43619/projects
```

### 4. Frontend Test
1. Open http://localhost:45937
2. Should see the portfolio dashboard
3. Try adding a repository through the UI

## Production Configuration

For production deployment, update these settings:

```bash
# Use strong passwords
DATABASE_URL=postgresql://secure_user:very_secure_password@db:5432/portfolio_db
ADMIN_BASIC_AUTH_PASS=VerySecurePassword123!

# Use GitHub App instead of personal tokens
GITHUB_APP_ID=your_production_app_id
GITHUB_APP_PRIVATE_KEY_PATH=./production-private-key.pem

# Restrict CORS origins
CORS_ORIGINS=https://your-domain.com

# Set organization restrictions
ALLOWED_ORGS=your-company-org

# Use info or warning log level
LOG_LEVEL=info
```

## Security Checklist

Before running with real data:

- [ ] Changed default admin password
- [ ] Using GitHub App instead of personal token (recommended)
- [ ] Set ALLOWED_ORGS if needed
- [ ] Configured proper CORS origins
- [ ] Reviewed security settings with `make security-check`
- [ ] Private key file has proper permissions (600)
- [ ] Environment file is not committed to git

## Next Steps

Once everything is running:

1. **Add your repositories** through the web interface
2. **Monitor activity** and contributor metrics
3. **Set up webhooks** (optional) for real-time updates
4. **Configure organization filters** if needed
5. **Set up regular backups** for production use

## Getting Help

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting) above
2. Run `make security-check` to verify configuration
3. Check container logs with `make logs`
4. Review the [SECURITY.md](docs/SECURITY.md) for security guidelines
5. See [PROJECT_FLOW.md](docs/PROJECT_FLOW.md) for technical details

The application should now be ready to track your GitHub repositories! 🎉