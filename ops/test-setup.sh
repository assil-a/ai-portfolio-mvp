#!/bin/bash

echo "🧪 AI Portfolio Console - Setup Test"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    echo -n "Testing $test_name... "
    
    result=$(eval "$test_command" 2>&1)
    
    if [[ $result =~ $expected_pattern ]]; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "  Expected pattern: $expected_pattern"
        echo "  Got: $result"
        ((TESTS_FAILED++))
    fi
}

echo ""
echo "🔍 Running Setup Tests..."
echo "========================"

# Test 1: Check if .env file exists
run_test "Environment file exists" "test -f .env && echo 'exists'" "exists"

# Test 2: Check if Docker is running
run_test "Docker daemon" "docker info > /dev/null 2>&1 && echo 'running'" "running"

# Test 3: Check if containers are running
run_test "Database container" "docker-compose ps db | grep -q 'Up' && echo 'up'" "up"
run_test "API container" "docker-compose ps api | grep -q 'Up' && echo 'up'" "up"
run_test "Web container" "docker-compose ps web | grep -q 'Up' && echo 'up'" "up"

# Test 4: Check API health endpoint
run_test "API health endpoint" "curl -s http://localhost:43619/healthz" '"status":"ok"'

# Test 5: Check web interface accessibility
run_test "Web interface" "curl -s -o /dev/null -w '%{http_code}' http://localhost:45937" "200"

# Test 6: Check API documentation
run_test "API documentation" "curl -s -o /dev/null -w '%{http_code}' http://localhost:43619/docs" "200"

# Test 7: Test adding a public repository
echo ""
echo "🔬 Testing Repository Addition..."
echo "================================"

# Test with a well-known public repository
test_repo_url="https://github.com/octocat/Hello-World"
echo "Testing with repository: $test_repo_url"

add_repo_result=$(curl -s -X POST http://localhost:43619/projects \
  -H "Content-Type: application/json" \
  -d "{\"repo_url\":\"$test_repo_url\"}" \
  -w "%{http_code}")

if [[ $add_repo_result =~ "200" ]] || [[ $add_repo_result =~ "201" ]]; then
    echo -e "${GREEN}✅ Repository addition test PASSED${NC}"
    ((TESTS_PASSED++))
    
    # Test listing projects
    list_result=$(curl -s http://localhost:43619/projects)
    if [[ $list_result =~ "Hello-World" ]]; then
        echo -e "${GREEN}✅ Repository listing test PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ Repository listing test FAILED${NC}"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${RED}❌ Repository addition test FAILED${NC}"
    echo "Response: $add_repo_result"
    ((TESTS_FAILED++))
fi

echo ""
echo "📊 Test Results Summary"
echo "======================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Your setup is working correctly.${NC}"
    echo ""
    echo "✅ You can now:"
    echo "1. Open http://localhost:45937 to use the web interface"
    echo "2. Add your own GitHub repositories"
    echo "3. Monitor repository activity and contributors"
    echo ""
    echo "📚 Next steps:"
    echo "- Read the Configuration Guide for advanced setup"
    echo "- Check the Security Guide for production deployment"
    echo "- Explore the API documentation at http://localhost:43619/docs"
    
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  Some tests failed. Please check the following:${NC}"
    echo ""
    echo "🔧 Troubleshooting steps:"
    echo "1. Ensure all containers are running: make status"
    echo "2. Check container logs: make logs"
    echo "3. Verify your .env configuration"
    echo "4. Check GitHub token permissions"
    echo "5. Wait a bit longer for services to fully start"
    echo ""
    echo "📋 Common issues:"
    echo "- GitHub token missing or invalid"
    echo "- Containers still starting up (wait 30 seconds and retry)"
    echo "- Port conflicts (check if ports 43619/45937 are free)"
    echo "- Docker daemon not running"
    
    exit 1
fi