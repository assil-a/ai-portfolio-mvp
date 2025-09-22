#!/bin/bash

echo "🔍 AI Portfolio Console - Verification Script"
echo "=============================================="

# Check project structure
echo "📁 Checking project structure..."
required_dirs=("api" "web" "ops" "docs")
for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "  ✅ $dir/ exists"
    else
        echo "  ❌ $dir/ missing"
        exit 1
    fi
done

# Check backend files
echo "🐍 Checking backend files..."
backend_files=(
    "api/app/main.py"
    "api/app/core/config.py"
    "api/app/models/project.py"
    "api/app/routers/projects.py"
    "api/app/services/github_client.py"
    "api/requirements.txt"
    "api/Dockerfile"
)

for file in "${backend_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file missing"
        exit 1
    fi
done

# Check frontend files
echo "⚛️  Checking frontend files..."
frontend_files=(
    "web/package.json"
    "web/src/App.tsx"
    "web/src/components/ProjectsTable.tsx"
    "web/src/api/client.ts"
    "web/Dockerfile"
)

for file in "${frontend_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file missing"
        exit 1
    fi
done

# Check Docker files
echo "🐳 Checking Docker configuration..."
docker_files=(
    "ops/docker-compose.yml"
    "ops/.env.example"
    "ops/Makefile"
)

for file in "${docker_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file missing"
        exit 1
    fi
done

# Check documentation
echo "📚 Checking documentation..."
doc_files=(
    "README.md"
    "docs/API.md"
)

for file in "${doc_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file missing"
        exit 1
    fi
done

# Test backend imports
echo "🧪 Testing backend imports..."
cd api
if python -c "from app.main import app; print('✅ FastAPI app imports successfully')" 2>/dev/null; then
    echo "  ✅ Backend imports working"
else
    echo "  ❌ Backend import issues"
    exit 1
fi
cd ..

# Test frontend build
echo "🏗️  Testing frontend build..."
cd web
if [ -d "dist" ]; then
    echo "  ✅ Frontend build exists"
else
    echo "  ❌ Frontend not built"
    exit 1
fi
cd ..

echo ""
echo "🎉 All checks passed! AI Portfolio Console is ready."
echo ""
echo "Next steps:"
echo "1. Copy ops/.env.example to ops/.env and configure GitHub credentials"
echo "2. Run 'cd ops && make dev' to start the application"
echo "3. Visit http://localhost:45937 for the web interface"
echo "4. Visit http://localhost:43619/docs for API documentation"