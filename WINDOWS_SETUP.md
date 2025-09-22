# Windows Setup Guide - AI Portfolio Console

## Running on Windows (Without Make)

Since you're on Windows and don't have `make` installed, here are the direct commands to run the project:

### Option 1: Use Docker Compose Directly (Recommended)

```bash
# Navigate to the ops directory
cd ops

# Copy environment template
cp .env.example .env

# Edit the .env file with your GitHub credentials
# Use your preferred text editor (notepad, VS Code, etc.)
notepad .env
# OR
code .env

# Build and start all services
docker-compose up --build -d

# Check if services are running
docker-compose ps

# View logs if needed
docker-compose logs
```

### Option 2: Install Make for Windows

#### Using Chocolatey (if you have it):
```bash
choco install make
```

#### Using Scoop (if you have it):
```bash
scoop install make
```

#### Manual Installation:
1. Download Make for Windows from: http://gnuwin32.sourceforge.net/packages/make.htm
2. Add it to your PATH
3. Restart your terminal

### Option 3: Use PowerShell Scripts

I'll create PowerShell equivalents for you:

#### Start Development Environment:
```powershell
# In PowerShell (not Git Bash)
cd ops
docker-compose up --build -d
```

## Step-by-Step Windows Setup

### 1. Prerequisites Check

Make sure you have:
- **Docker Desktop** installed and running
- **Git** installed
- A **GitHub account**

### 2. Configure GitHub Access

You need a GitHub Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "AI Portfolio Console"
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `public_repo` (Access public repositories)
5. Click "Generate token"
6. **Copy the token** (starts with `ghp_`)

### 3. Configure Environment

Edit the `.env` file in the `ops` directory:

```bash
# GitHub Configuration
OAUTH_GITHUB_CLIENT_ID=your_github_username
OAUTH_GITHUB_CLIENT_SECRET=ghp_your_token_here

# Database (keep as is for local development)
DATABASE_URL=postgresql://portfolio_user:portfolio_pass@db:5432/portfolio_db

# API Configuration
PORT=43619
CONTRIBUTOR_WINDOW_DAYS=90

# Admin Access
ADMIN_BASIC_AUTH_USER=admin
ADMIN_BASIC_AUTH_PASS=your_secure_password
```

### 4. Start the Application

```bash
# In Git Bash or Command Prompt
cd ops

# Start all services
docker-compose up --build -d

# Wait for services to start (about 30 seconds)
# Then check status
docker-compose ps
```

### 5. Access the Application

- **Web Interface**: http://localhost:45937
- **API Docs**: http://localhost:43619/docs
- **Health Check**: http://localhost:43619/healthz

## Windows-Specific Commands

Instead of `make` commands, use these Docker Compose commands:

### Development Commands:
```bash
# Start development environment
docker-compose up --build -d

# Stop services
docker-compose down

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs api
docker-compose logs web
docker-compose logs db

# Restart services
docker-compose restart

# Check service status
docker-compose ps

# Run database migrations
docker-compose exec api alembic upgrade head

# Seed sample data
docker-compose exec api python scripts/seed_data.py
```

### Testing Commands:
```bash
# Run backend tests
docker-compose exec api pytest

# Check API health
curl http://localhost:43619/healthz

# Test adding a repository
curl -X POST http://localhost:43619/projects -H "Content-Type: application/json" -d "{\"repo_url\":\"https://github.com/facebook/react\"}"
```

### Cleanup Commands:
```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes (complete cleanup)
docker-compose down -v

# Remove images as well
docker-compose down -v --rmi all
```

## Troubleshooting Windows Issues

### 1. Docker Desktop Not Running
**Error**: `Cannot connect to the Docker daemon`
**Solution**: Start Docker Desktop from the Start menu

### 2. Port Already in Use
**Error**: `Port 43619 is already in use`
**Solution**: 
```bash
# Find what's using the port
netstat -ano | findstr :43619

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### 3. Line Ending Issues
**Error**: Scripts fail with `\r` errors
**Solution**: Configure Git to handle line endings:
```bash
git config --global core.autocrlf true
```

### 4. Permission Issues
**Error**: Permission denied errors
**Solution**: Run Docker Desktop as Administrator

### 5. Firewall Issues
**Error**: Cannot access localhost URLs
**Solution**: Allow Docker through Windows Firewall

## PowerShell Scripts

Create these PowerShell scripts for easier management:

### start.ps1:
```powershell
Write-Host "Starting AI Portfolio Console..." -ForegroundColor Green
Set-Location ops
docker-compose up --build -d
Write-Host "Services started! Check http://localhost:45937" -ForegroundColor Green
```

### stop.ps1:
```powershell
Write-Host "Stopping AI Portfolio Console..." -ForegroundColor Yellow
Set-Location ops
docker-compose down
Write-Host "Services stopped!" -ForegroundColor Green
```

### logs.ps1:
```powershell
Set-Location ops
docker-compose logs -f
```

## Quick Test

After starting the services, test with:

```bash
# Test API health
curl http://localhost:43619/healthz

# Should return: {"status":"ok"}
```

Then open http://localhost:45937 in your browser to use the web interface.

## Alternative: Use WSL2

If you prefer a Linux-like environment:

1. Install WSL2 (Windows Subsystem for Linux)
2. Install Ubuntu from Microsoft Store
3. Run the project in WSL2 with full `make` support

```bash
# In WSL2 Ubuntu terminal
sudo apt update
sudo apt install make
cd /mnt/c/path/to/your/project
make dev
```

## Summary for Windows Users

**Simplest approach:**
1. Edit `ops/.env` with your GitHub token
2. Run `docker-compose up --build -d` in the `ops` directory
3. Open http://localhost:45937
4. Start adding repositories!

**Need help?** Check the main [Configuration Guide](CONFIGURATION_GUIDE.md) for detailed setup instructions.