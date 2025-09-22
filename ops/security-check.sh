#!/bin/bash

echo "🔒 AI Portfolio Console - Security Check"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track issues
ISSUES=0

# Check for .gitignore files
echo "📁 Checking .gitignore files..."
gitignore_files=(".gitignore" "api/.gitignore" "web/.gitignore" "ops/.gitignore")
for file in "${gitignore_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✅${NC} $file exists"
    else
        echo -e "  ${RED}❌${NC} $file missing"
        ((ISSUES++))
    fi
done

# Check for sensitive patterns in .gitignore
echo "🔍 Checking .gitignore patterns..."
sensitive_patterns=("*.env" "*.pem" "*.key" "*.token" "secrets.yaml" "database.url")
for pattern in "${sensitive_patterns[@]}"; do
    if grep -q "$pattern" .gitignore 2>/dev/null; then
        echo -e "  ${GREEN}✅${NC} Pattern '$pattern' is ignored"
    else
        echo -e "  ${YELLOW}⚠️${NC}  Pattern '$pattern' not found in root .gitignore"
        ((ISSUES++))
    fi
done

# Check for accidentally committed sensitive files
echo "🕵️  Scanning for sensitive files in git..."
sensitive_files=(
    "*.env"
    "*.pem" 
    "*.key"
    "*secret*"
    "*private*"
    "*.token"
    "database.url"
    "oauth-token.txt"
    "api-key.txt"
)

for pattern in "${sensitive_files[@]}"; do
    if git ls-files | grep -i "$pattern" >/dev/null 2>&1; then
        echo -e "  ${RED}❌${NC} Found potentially sensitive files matching '$pattern':"
        git ls-files | grep -i "$pattern" | sed 's/^/    /'
        ((ISSUES++))
    fi
done

# Check for hardcoded secrets in source code
echo "🔎 Scanning source code for hardcoded secrets..."
secret_patterns=(
    "password\s*=\s*['\"][^'\"]*['\"]"
    "secret\s*=\s*['\"][^'\"]*['\"]"
    "token\s*=\s*['\"][^'\"]*['\"]"
    "api_key\s*=\s*['\"][^'\"]*['\"]"
    "private_key\s*=\s*['\"][^'\"]*['\"]"
    "github_token\s*=\s*['\"][^'\"]*['\"]"
)

for pattern in "${secret_patterns[@]}"; do
    matches=$(grep -r -i -E "$pattern" --include="*.py" --include="*.js" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null || true)
    if [ -n "$matches" ]; then
        echo -e "  ${RED}❌${NC} Found potential hardcoded secrets:"
        echo "$matches" | sed 's/^/    /'
        ((ISSUES++))
    fi
done

# Check environment file examples
echo "📋 Checking environment file examples..."
if [ -f "ops/.env.example" ]; then
    echo -e "  ${GREEN}✅${NC} .env.example exists"
    
    # Check if .env.example contains actual secrets (should only have placeholders)
    if grep -E "(sk-|ghp_|gho_|ghu_|ghs_)" ops/.env.example >/dev/null 2>&1; then
        echo -e "  ${RED}❌${NC} .env.example contains what looks like real secrets"
        ((ISSUES++))
    else
        echo -e "  ${GREEN}✅${NC} .env.example contains only placeholders"
    fi
else
    echo -e "  ${RED}❌${NC} .env.example missing"
    ((ISSUES++))
fi

# Check for .env files that shouldn't be committed
if [ -f ".env" ] || [ -f "ops/.env" ] || [ -f "api/.env" ] || [ -f "web/.env" ]; then
    echo -e "  ${YELLOW}⚠️${NC}  Found .env files (make sure they're not committed to git)"
fi

# Check Docker files for secrets
echo "🐳 Checking Docker files for hardcoded secrets..."
docker_files=("api/Dockerfile" "web/Dockerfile" "ops/docker-compose.yml")
for file in "${docker_files[@]}"; do
    if [ -f "$file" ]; then
        if grep -E "(password|secret|token|key).*=" "$file" | grep -v -E "(ENV|ARG|\$\{)" >/dev/null 2>&1; then
            echo -e "  ${RED}❌${NC} $file may contain hardcoded secrets"
            ((ISSUES++))
        else
            echo -e "  ${GREEN}✅${NC} $file looks secure"
        fi
    fi
done

# Check for security documentation
echo "📚 Checking security documentation..."
if [ -f "docs/SECURITY.md" ]; then
    echo -e "  ${GREEN}✅${NC} Security documentation exists"
else
    echo -e "  ${RED}❌${NC} Security documentation missing"
    ((ISSUES++))
fi

# Check git configuration
echo "⚙️  Checking git configuration..."
if git config --get user.email >/dev/null 2>&1; then
    echo -e "  ${GREEN}✅${NC} Git user email configured"
else
    echo -e "  ${YELLOW}⚠️${NC}  Git user email not configured"
fi

# Summary
echo ""
echo "📊 Security Check Summary"
echo "========================"
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 No security issues found!${NC}"
    echo ""
    echo "✅ All .gitignore files are present"
    echo "✅ No sensitive files found in git"
    echo "✅ No hardcoded secrets detected"
    echo "✅ Environment configuration looks secure"
    echo "✅ Docker files are secure"
    echo "✅ Security documentation is available"
else
    echo -e "${RED}⚠️  Found $ISSUES potential security issues${NC}"
    echo ""
    echo "Please review the issues above and take appropriate action:"
    echo "1. Add missing .gitignore patterns"
    echo "2. Remove any committed sensitive files"
    echo "3. Replace hardcoded secrets with environment variables"
    echo "4. Review security documentation in docs/SECURITY.md"
fi

echo ""
echo "🔗 For more information, see docs/SECURITY.md"

exit $ISSUES