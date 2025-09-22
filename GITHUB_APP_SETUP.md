# GitHub App Configuration Guide

## You've Created a GitHub App - Now Let's Configure It!

### Step 1: Gather Your GitHub App Information

From your GitHub App settings page, you'll need:

1. **App ID** - Found at the top of your app's settings page
2. **Private Key** - You need to generate and download this
3. **Installation ID** - You get this when you install the app

### Step 2: Get Your App ID

1. Go to GitHub → Settings → Developer settings → GitHub Apps
2. Click on your app name
3. Note the **App ID** (it's a number like `123456`)

### Step 3: Generate and Download Private Key

1. In your GitHub App settings, scroll down to "Private keys"
2. Click **"Generate a private key"**
3. A `.pem` file will be downloaded to your computer
4. Move this file to your project's `ops` directory
5. Rename it to something simple like `github-app-private-key.pem`

### Step 4: Install Your GitHub App

1. In your GitHub App settings, click **"Install App"** (left sidebar)
2. Choose your account or organization
3. Select **"All repositories"** or choose specific repositories you want to track
4. Click **"Install"**
5. After installation, note the URL - it will contain the Installation ID
   - URL looks like: `https://github.com/settings/installations/12345678`
   - The number `12345678` is your Installation ID

### Step 5: Configure Your Environment

Edit the `ops/.env` file with your GitHub App details:

```bash
# GitHub App Configuration
GITHUB_APP_ID=123456  # Your App ID from step 2
GITHUB_APP_PRIVATE_KEY_PATH=./github-app-private-key.pem  # Path to your private key
GITHUB_WEBHOOK_SECRET=your_optional_webhook_secret  # Optional, can leave empty

# Leave OAuth settings empty when using GitHub App
OAUTH_GITHUB_CLIENT_ID=
OAUTH_GITHUB_CLIENT_SECRET=

# Database Configuration (keep as is for local development)
DATABASE_URL=postgresql://portfolio_user:portfolio_pass@db:5432/portfolio_db

# API Configuration
PORT=43619
CONTRIBUTOR_WINDOW_DAYS=90

# Admin Access
ADMIN_BASIC_AUTH_USER=admin
ADMIN_BASIC_AUTH_PASS=your_secure_password

# Optional: Restrict to specific organizations
ALLOWED_ORGS=your-org-name
```

### Step 6: Verify Your GitHub App Permissions

Make sure your GitHub App has these permissions:

#### Repository Permissions:
- **Contents**: Read ✅
- **Metadata**: Read ✅  
- **Pull requests**: Read ✅

#### User Permissions:
- None required

### Step 7: Complete .env File Example

Here's a complete example of what your `.env` file should look like:

```bash
# ===========================================
# AI Portfolio Console - GitHub App Config
# ===========================================

# GitHub App Configuration
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY_PATH=./github-app-private-key.pem
GITHUB_WEBHOOK_SECRET=

# OAuth Configuration (leave empty for GitHub App)
OAUTH_GITHUB_CLIENT_ID=
OAUTH_GITHUB_CLIENT_SECRET=

# Database Configuration
DATABASE_URL=postgresql://portfolio_user:portfolio_pass@db:5432/portfolio_db

# API Server Configuration
PORT=43619
CONTRIBUTOR_WINDOW_DAYS=90

# Admin Authentication
ADMIN_BASIC_AUTH_USER=admin
ADMIN_BASIC_AUTH_PASS=MySecurePassword123!

# Security Configuration
ALLOWED_ORGS=
CORS_ORIGINS=http://localhost:45937

# Logging
LOG_LEVEL=info
```

### Step 8: File Structure Check

Make sure your `ops` directory looks like this:

```
ops/
├── .env                           # Your configuration
├── .env.example                   # Template file
├── github-app-private-key.pem     # Your private key file
├── docker-compose.yml             # Docker configuration
├── start.ps1                      # PowerShell start script
├── start.bat                      # Batch start script
└── ... (other files)
```

### Step 9: Start the Application

Since you're on Windows without `make`, use one of these methods:

#### Option A: PowerShell (Recommended)
```powershell
# Open PowerShell in the ops directory
cd ops
.\start.ps1
```

#### Option B: Command Prompt
```cmd
# Open Command Prompt in the ops directory
cd ops
start.bat
```

#### Option C: Direct Docker Commands
```bash
# In Git Bash or Command Prompt
cd ops
docker-compose up --build -d
```

### Step 10: Test Your Setup

1. **Check if services are running:**
   ```bash
   docker-compose ps
   ```

2. **Test API health:**
   ```bash
   curl http://localhost:43619/healthz
   ```
   Should return: `{"status":"ok"}`

3. **Open web interface:**
   Go to: http://localhost:45937

4. **Test with a repository:**
   - Click "Add Repository"
   - Try adding a repository that your GitHub App has access to
   - Example: `https://github.com/your-username/your-repo`

### Troubleshooting GitHub App Issues

#### Issue 1: "GitHub App not found"
**Cause**: Wrong App ID
**Solution**: Double-check your App ID in GitHub settings

#### Issue 2: "Invalid private key"
**Cause**: Private key file issues
**Solutions**:
- Make sure the `.pem` file is in the `ops` directory
- Check the file path in `GITHUB_APP_PRIVATE_KEY_PATH`
- Ensure the file isn't corrupted (re-download if needed)

#### Issue 3: "Installation not found"
**Cause**: App not installed on the repository
**Solution**: 
1. Go to your GitHub App settings
2. Click "Install App"
3. Install it on your account/organization
4. Make sure it has access to the repositories you want to track

#### Issue 4: "Insufficient permissions"
**Cause**: App doesn't have required permissions
**Solution**:
1. Go to your GitHub App settings
2. Check "Repository permissions"
3. Ensure you have:
   - Contents: Read
   - Metadata: Read
   - Pull requests: Read

### Advantages of Using GitHub App

✅ **Higher rate limits** (5,000 requests/hour vs 1,000 for personal tokens)
✅ **Better security** (scoped permissions)
✅ **Organization-wide access** (if installed at org level)
✅ **No personal token management** needed
✅ **Webhook support** for real-time updates

### Next Steps

Once everything is working:

1. **Add repositories** through the web interface
2. **Monitor the activity** and contributor metrics
3. **Set up webhooks** (optional) for real-time updates
4. **Configure organization filters** if needed

### Need Help?

If you encounter issues:

1. Check the container logs: `docker-compose logs`
2. Verify your GitHub App permissions
3. Make sure the private key file is accessible
4. Test with a simple public repository first
5. Check the [Windows Setup Guide](WINDOWS_SETUP.md) for Windows-specific troubleshooting

Your GitHub App setup should now be ready to track repositories! 🎉