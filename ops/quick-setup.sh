#!/bin/bash

echo "🚀 AI Portfolio Console - Quick Setup"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file already exists. Backing up to .env.backup${NC}"
    cp .env .env.backup
fi

# Copy example file
echo -e "${GREEN}📋 Creating .env file from template...${NC}"
cp .env.example .env

echo ""
echo "🔧 Configuration Setup"
echo "====================="

# Get GitHub username
read -p "Enter your GitHub username: " github_username
if [ -n "$github_username" ]; then
    sed -i "s/your_github_username/$github_username/g" .env
    echo -e "${GREEN}✅ GitHub username set to: $github_username${NC}"
fi

# Get GitHub token
echo ""
echo "🔑 GitHub Personal Access Token Setup"
echo "======================================"
echo "You need a GitHub Personal Access Token to access repositories."
echo ""
echo "To create one:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Select scopes: 'repo' and 'public_repo'"
echo "4. Copy the generated token"
echo ""
read -p "Enter your GitHub Personal Access Token (ghp_...): " github_token

if [ -n "$github_token" ]; then
    # Validate token format
    if [[ $github_token == ghp_* ]]; then
        sed -i "s/ghp_your_personal_access_token_here/$github_token/g" .env
        echo -e "${GREEN}✅ GitHub token configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Token doesn't look like a GitHub personal access token (should start with 'ghp_')${NC}"
        echo "Continuing anyway..."
        sed -i "s/ghp_your_personal_access_token_here/$github_token/g" .env
    fi
else
    echo -e "${YELLOW}⚠️  No token provided. You'll need to add it manually to .env${NC}"
fi

# Set admin password
echo ""
read -p "Set admin password (or press Enter for default 'admin123'): " admin_pass
if [ -n "$admin_pass" ]; then
    sed -i "s/your_secure_password/$admin_pass/g" .env
    echo -e "${GREEN}✅ Admin password set${NC}"
else
    sed -i "s/your_secure_password/admin123/g" .env
    echo -e "${YELLOW}⚠️  Using default admin password 'admin123'${NC}"
fi

echo ""
echo "🐳 Docker Setup"
echo "==============="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Check if docker-compose is available
if command -v docker-compose > /dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
elif docker compose version > /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    echo -e "${RED}❌ Docker Compose not found. Please install Docker Compose.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker Compose is available${NC}"

echo ""
echo "🏗️  Building and Starting Services"
echo "=================================="

# Build and start services
echo "Building containers..."
$COMPOSE_CMD build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo "Starting services..."
$COMPOSE_CMD up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Services started${NC}"
else
    echo -e "${RED}❌ Failed to start services${NC}"
    exit 1
fi

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check health
echo "🏥 Checking service health..."

# Check API health
if curl -s http://localhost:43619/healthz > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  API not responding yet (may need more time)${NC}"
fi

# Check if web is accessible
if curl -s http://localhost:45937 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Web interface is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Web interface not responding yet (may need more time)${NC}"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Your AI Portfolio Console is now running:"
echo ""
echo "🌐 Web Interface:    http://localhost:45937"
echo "📚 API Documentation: http://localhost:43619/docs"
echo "🏥 Health Check:     http://localhost:43619/healthz"
echo ""
echo "📋 Next Steps:"
echo "1. Open http://localhost:45937 in your browser"
echo "2. Click 'Add Repository' to add your first GitHub repository"
echo "3. Try adding: https://github.com/facebook/react (public repo)"
echo "4. Then add your own repositories!"
echo ""
echo "🔧 Useful Commands:"
echo "make logs          # View all service logs"
echo "make status        # Check service status"
echo "make security-check # Run security validation"
echo "make down          # Stop all services"
echo ""
echo "📖 Need help? Check:"
echo "- Configuration Guide: ../CONFIGURATION_GUIDE.md"
echo "- Simple Explanation: ../SIMPLE_EXPLANATION.md"
echo "- Security Guide: ../docs/SECURITY.md"
echo ""

# Show current status
echo "📊 Current Service Status:"
$COMPOSE_CMD ps

echo ""
echo -e "${GREEN}🚀 Happy repository tracking!${NC}"