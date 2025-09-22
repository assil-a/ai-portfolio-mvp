# AI Portfolio Console

A lightweight web application for managing and monitoring GitHub repository portfolios. Track repository activity, contributor engagement, and project health across your organization's codebase.

📖 **New to this project?** Check out our [Simple Explanation](SIMPLE_EXPLANATION.md) for an easy-to-understand overview!

🚀 **Ready to run it?** Follow our [Configuration Guide](CONFIGURATION_GUIDE.md) for step-by-step setup instructions!

💻 **Windows user?** Check out our [Windows Setup Guide](WINDOWS_SETUP.md) for Windows-specific instructions!

## Features

- **Repository Management**: Add GitHub repositories via URL and track their metadata
- **Activity Monitoring**: View last commit activity and identify active contributors
- **Contributor Analytics**: Track contributor activity over a 90-day rolling window
- **Portfolio Overview**: Sortable table view with search functionality
- **Project Details**: Detailed view with contributor lists and latest PR information
- **GitHub Integration**: Support for both GitHub App and OAuth authentication
- **Real-time Updates**: Refresh project data on-demand

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI + Python 3.11
- **Database**: PostgreSQL with SQLAlchemy 2.x + Alembic migrations
- **Integration**: GitHub GraphQL API with REST fallback
- **Deployment**: Docker Compose with health checks

## Quick Start

### Option 1: Interactive Setup (Recommended for First-Time Users)

```bash
git clone <repository-url>
cd ai-portfolio-console/ops
make quick-setup
```

The interactive wizard will:
- Guide you through GitHub token setup
- Configure environment variables
- Build and start all services
- Test the setup automatically

### Option 2: Manual Setup

#### Prerequisites
- Docker and Docker Compose
- GitHub Personal Access Token or GitHub App

#### Steps
```bash
git clone <repository-url>
cd ai-portfolio-console
cp ops/.env.example ops/.env
# Edit ops/.env with your GitHub credentials
cd ops
make dev
```

### Verify Your Setup

```bash
make test-setup  # Run automated tests
```

This will:
- Build and start all services (database, API, web)
- Run database migrations
- Seed with sample data

### 4. Access the Application

- **Web Interface**: http://localhost:45937
- **API Documentation**: http://localhost:43619/docs
- **Health Check**: http://localhost:43619/healthz

## Development

### Project Structure

```
/
├── api/                 # FastAPI backend
│   ├── app/
│   │   ├── core/       # Configuration, database
│   │   ├── models/     # SQLAlchemy models
│   │   ├── routers/    # API endpoints
│   │   ├── schemas/    # Pydantic schemas
│   │   └── services/   # Business logic
│   ├── migrations/     # Alembic migrations
│   ├── scripts/        # Utility scripts
│   └── tests/          # Backend tests
├── web/                # React frontend
│   ├── src/
│   │   ├── api/        # API client
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom hooks
│   │   └── utils/      # Utilities
│   └── public/         # Static assets
├── ops/                # Operations
│   ├── docker-compose.yml
│   ├── .env.example
│   └── Makefile
└── docs/               # Documentation
```

### Available Commands

```bash
# Development
make dev          # Start development environment
make build        # Build all services
make up           # Start services
make down         # Stop services
make logs         # View logs
make restart      # Restart services

# Database
make migrate      # Run migrations
make seed         # Seed sample data

# Setup & Testing
make quick-setup  # Interactive setup wizard (first-time users)
make test-setup   # Test if setup is working correctly
make test         # Run all tests
make security-check # Run security validation
make clean        # Clean up containers and volumes
```

### API Endpoints

#### Projects

- `GET /projects` - List projects with pagination and sorting
- `POST /projects` - Add new repository
- `GET /projects/{id}` - Get project details with contributors
- `POST /projects/{id}/refresh` - Refresh project data

#### Health

- `GET /healthz` - Health check endpoint

#### Webhooks (Optional)

- `POST /webhooks/github` - GitHub webhook handler

### Frontend Components

- **ProjectsTable**: Main portfolio view with sorting and search
- **ProjectDetail**: Detailed project view with contributor analytics
- **AddRepoModal**: Repository addition interface

## Configuration

### Environment Variables

#### Backend (`api/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@db:5432/ai_portfolio` |
| `GITHUB_APP_ID` | GitHub App ID | - |
| `GITHUB_APP_PRIVATE_KEY` | GitHub App private key | - |
| `GITHUB_WEBHOOK_SECRET` | Webhook secret for verification | - |
| `OAUTH_GITHUB_CLIENT_ID` | OAuth client ID (fallback) | - |
| `OAUTH_GITHUB_CLIENT_SECRET` | OAuth client secret (fallback) | - |
| `CONTRIBUTOR_WINDOW_DAYS` | Contributor activity window | `90` |
| `ALLOWED_ORGS` | Comma-separated list of allowed orgs | - |
| `ADMIN_BASIC_AUTH_USER` | Admin username | - |
| `ADMIN_BASIC_AUTH_PASS` | Admin password | - |

#### Frontend (`web/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:43619` |
| `VITE_GITHUB_APP_INSTALL_URL` | GitHub App installation URL | - |

### GitHub Integration

#### GitHub App (Recommended)

1. Create a GitHub App in your organization
2. Set permissions:
   - Repository: Contents (Read)
   - Repository: Metadata (Read)
   - Repository: Pull requests (Read)
3. Generate and download private key
4. Configure webhook URL (optional): `https://your-domain.com/webhooks/github`

#### OAuth App (Fallback)

1. Create OAuth App in GitHub
2. Set Authorization callback URL: `https://your-domain.com/auth/callback`
3. Configure client ID and secret

## Security

- **Read-only Access**: Only reads repository metadata, never writes
- **Token Security**: Encrypts and securely stores authentication tokens
- **Rate Limiting**: Respects GitHub API rate limits with exponential backoff
- **Input Validation**: Validates all user inputs and API responses
- **CORS Protection**: Configurable CORS settings
- **Webhook Verification**: Verifies GitHub webhook signatures
- **Secret Protection**: Comprehensive `.gitignore` files prevent committing sensitive data
- **Environment Variables**: All secrets managed through environment variables

⚠️ **Important**: See [SECURITY.md](docs/SECURITY.md) for detailed security guidelines and best practices.

## Monitoring

### Health Checks

- **Database**: PostgreSQL connection and query health
- **API**: FastAPI application health
- **Frontend**: React application availability

### Logging

Structured JSON logging with configurable levels:

```bash
# View logs
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f db
```

## Testing

### Backend Tests

```bash
# Run all backend tests
cd api
pytest

# Run with coverage
pytest --cov=app
```

### Frontend Tests

```bash
# Run frontend tests
cd web
npm test

# Run E2E tests
npm run test:e2e
```

## Deployment

### Production Setup

1. **Environment Configuration**:
   ```bash
   cp ops/.env.example ops/.env.production
   # Edit with production values
   ```

2. **SSL/TLS**: Configure reverse proxy (nginx/traefik) with SSL certificates

3. **Database**: Use managed PostgreSQL service or configure backup/recovery

4. **Monitoring**: Set up application monitoring and alerting

5. **Scaling**: Configure horizontal scaling for API service

### Docker Production

```bash
# Production build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# With custom environment
docker-compose --env-file .env.production up -d
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database status
   docker-compose ps db
   docker-compose logs db
   ```

2. **GitHub API Rate Limiting**
   - Verify GitHub App/OAuth configuration
   - Check rate limit headers in logs
   - Consider using GitHub App for higher limits

3. **Frontend Build Errors**
   ```bash
   # Clear node modules and reinstall
   cd web
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Migration Issues**
   ```bash
   # Reset database (development only)
   make clean
   make up
   make migrate
   ```

### Debug Mode

Enable debug logging:

```bash
# Backend
LOG_LEVEL=debug docker-compose up

# Frontend
VITE_DEBUG=true npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for all frontend code
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: GitHub Issues for bug reports and feature requests
- **Documentation**: Check `/docs` directory for detailed guides
- **API Reference**: Visit `/docs` endpoint when running locally

---

Built with ❤️ for better repository portfolio management.