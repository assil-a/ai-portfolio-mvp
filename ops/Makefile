.PHONY: help build up down logs clean test migrate seed

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all services
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## Show logs for all services
	docker-compose logs -f

clean: ## Clean up containers, networks, and volumes
	docker-compose down -v --remove-orphans
	docker system prune -f

test: ## Run tests
	docker-compose exec api pytest
	docker-compose exec web npm test

migrate: ## Run database migrations
	docker-compose exec api alembic upgrade head

seed: ## Seed database with sample data
	docker-compose exec api python scripts/seed.py

dev: ## Start development environment
	docker-compose up --build

restart: ## Restart all services
	docker-compose restart

status: ## Show service status
	docker-compose ps

security-check: ## Run security validation checks
	./security-check.sh

quick-setup: ## Interactive setup wizard for first-time users
	./quick-setup.sh

test-setup: ## Test if the setup is working correctly
	./test-setup.sh