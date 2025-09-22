# Security Guidelines

## Overview

This document outlines the security measures implemented in the AI Portfolio Console to protect sensitive data, private keys, and secrets from being committed to version control or exposed in production.

## Git Security

### .gitignore Protection

The project includes comprehensive `.gitignore` files at multiple levels to prevent sensitive data from being committed:

#### Root Level (/.gitignore)
- Environment variables (`.env*`, `*.env`)
- Private keys (`*.pem`, `*.key`, `github-app-*.pem`)
- Certificates (`*.crt`, `*.cer`, `*.der`, `*.p12`, `*.pfx`)
- SSH keys (`id_rsa*`, `id_dsa*`, `id_ecdsa*`, `id_ed25519*`)
- API tokens (`*.token`, `oauth-token.txt`, `api-key.txt`)
- Database credentials (`database.url`, `db-credentials.json`)
- Configuration files with secrets (`secrets.yaml`, `vault.json`)
- Cloud provider credentials (`.aws/`, `.azure/`, `gcloud-service-key.json`)

#### API Level (/api/.gitignore)
- Python-specific sensitive files
- Database files (`*.db`, `*.sqlite`)
- Alembic migrations with secrets
- Virtual environment directories

#### Web Level (/web/.gitignore)
- Node.js environment files
- Build artifacts that might contain secrets
- Frontend configuration with API keys

#### Operations Level (/ops/.gitignore)
- Docker Compose override files with secrets
- Kubernetes secret manifests
- Terraform state files
- Infrastructure credentials

### Pre-commit Hooks (Recommended)

Consider adding pre-commit hooks to scan for secrets:

```bash
# Install pre-commit
pip install pre-commit

# Add to .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

## Environment Variables

### Secure Configuration

All sensitive configuration is handled through environment variables:

```bash
# GitHub App Configuration
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# OAuth Configuration
OAUTH_GITHUB_CLIENT_ID=your_client_id
OAUTH_GITHUB_CLIENT_SECRET=your_client_secret

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Admin Authentication
ADMIN_BASIC_AUTH_USER=admin
ADMIN_BASIC_AUTH_PASS=secure_password
```

### Environment File Management

1. **Never commit `.env` files** - They are ignored by git
2. **Use `.env.example`** - Template without real values
3. **Separate environments** - Different files for dev/staging/prod
4. **Rotate secrets regularly** - Update tokens and keys periodically

## GitHub Integration Security

### GitHub App (Recommended)

- **Installation tokens** are short-lived (1 hour)
- **Private key** is stored securely and never logged
- **Webhook signatures** are verified using HMAC-SHA256
- **Permissions** are minimal (read-only repository access)

### OAuth Fallback

- **Client secrets** are stored in environment variables
- **Access tokens** are encrypted before storage
- **Scopes** are limited to necessary permissions only

### API Security

- **Rate limiting** respects GitHub's limits
- **Exponential backoff** on rate limit errors
- **Token rotation** for expired credentials
- **Error handling** never exposes tokens in logs

## Data Protection

### Database Security

- **Connection strings** use environment variables
- **Passwords** are never stored in plain text
- **Migrations** don't contain sensitive data
- **Backups** exclude sensitive tables if needed

### Logging Security

- **Structured logging** with sensitive data filtering
- **Token masking** in all log outputs
- **Error messages** don't expose internal details
- **Log rotation** to prevent disk space issues

### API Security

- **Input validation** on all endpoints
- **SQL injection** prevention via SQLAlchemy ORM
- **CORS configuration** restricts origins
- **Rate limiting** prevents abuse

## Production Security

### Docker Security

- **Non-root users** in all containers
- **Minimal base images** (Alpine Linux)
- **Security scanning** of container images
- **Secret management** via Docker secrets or external vaults

### Network Security

- **HTTPS only** in production
- **Reverse proxy** (nginx/traefik) with SSL termination
- **Internal networks** for service communication
- **Firewall rules** restricting access

### Monitoring

- **Health checks** for all services
- **Security alerts** for failed authentication
- **Audit logging** for admin actions
- **Intrusion detection** monitoring

## Secret Management Best Practices

### Development

1. **Use `.env.example`** as a template
2. **Copy to `.env`** and fill with real values
3. **Never share `.env`** files via chat/email
4. **Use different secrets** for each environment

### Production

1. **External secret management** (AWS Secrets Manager, HashiCorp Vault)
2. **Encrypted storage** for all secrets
3. **Access controls** with least privilege
4. **Audit trails** for secret access
5. **Regular rotation** of all credentials

### Key Rotation

1. **GitHub App keys** - Rotate annually or when compromised
2. **Database passwords** - Rotate quarterly
3. **API tokens** - Use short-lived tokens when possible
4. **Webhook secrets** - Rotate when team members leave

## Incident Response

### If Secrets Are Compromised

1. **Immediately revoke** the compromised credentials
2. **Generate new secrets** and update configuration
3. **Review git history** for any committed secrets
4. **Scan logs** for unauthorized access
5. **Update security measures** to prevent recurrence

### Git History Cleanup

If secrets were accidentally committed:

```bash
# Remove from git history (DANGEROUS - rewrites history)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/secret/file' \
  --prune-empty --tag-name-filter cat -- --all

# Force push (coordinate with team)
git push origin --force --all
git push origin --force --tags
```

## Security Checklist

### Before Deployment

- [ ] All `.env` files are ignored by git
- [ ] No secrets in source code or configuration files
- [ ] GitHub App/OAuth credentials are properly configured
- [ ] Database connection uses environment variables
- [ ] Webhook signatures are verified
- [ ] HTTPS is enforced in production
- [ ] Security headers are configured
- [ ] Rate limiting is enabled
- [ ] Logging doesn't expose sensitive data

### Regular Maintenance

- [ ] Review and rotate secrets quarterly
- [ ] Update dependencies for security patches
- [ ] Monitor for security vulnerabilities
- [ ] Review access logs for suspicious activity
- [ ] Test backup and recovery procedures
- [ ] Validate security configurations

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** create a public GitHub issue
2. **Email** the security team directly
3. **Include** detailed information about the vulnerability
4. **Wait** for acknowledgment before public disclosure
5. **Follow** responsible disclosure practices

## Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)