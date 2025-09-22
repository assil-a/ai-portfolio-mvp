# Quick Setup Checklist - GitHub App Configuration

## ✅ Pre-Setup Checklist

- [ ] Docker Desktop is installed and running
- [ ] You have created a GitHub App
- [ ] You have the project files downloaded

## 🔧 Configuration Steps

### 1. Gather GitHub App Information
- [ ] Get your **App ID** from GitHub App settings
- [ ] Generate and download the **private key** (.pem file)
- [ ] Install your GitHub App on your account/repositories
- [ ] Note which repositories the app has access to

### 2. Prepare Files
- [ ] Navigate to the `ops` directory in your project
- [ ] Copy the private key file to the `ops` directory
- [ ] Rename it to `github-app-private-key.pem`
- [ ] Copy `.env.example` to `.env`

### 3. Edit Configuration
Edit the `ops/.env` file with these values:

```bash
# Replace with your actual App ID (number)
GITHUB_APP_ID=123456

# Path to your private key file
GITHUB_APP_PRIVATE_KEY_PATH=./github-app-private-key.pem

# Leave empty for now
GITHUB_WEBHOOK_SECRET=

# Leave OAuth settings empty
OAUTH_GITHUB_CLIENT_ID=
OAUTH_GITHUB_CLIENT_SECRET=

# Keep database settings as is
DATABASE_URL=postgresql://portfolio_user:portfolio_pass@db:5432/portfolio_db

# Set a secure admin password
ADMIN_BASIC_AUTH_PASS=YourSecurePassword123!
```

### 4. Start the Application

Choose one method:

#### Method A: PowerShell (Recommended)
```powershell
cd ops
.\start.ps1
```

#### Method B: Command Prompt
```cmd
cd ops
start.bat
```

#### Method C: Direct Docker Commands
```bash
cd ops
docker-compose up --build -d
```

### 5. Verify Setup
- [ ] Services are running: `docker-compose ps`
- [ ] API is healthy: Open http://localhost:43619/healthz
- [ ] Web interface loads: Open http://localhost:45937

### 6. Test with Repository
- [ ] Click "Add Repository" in the web interface
- [ ] Add a repository your GitHub App has access to
- [ ] Verify it appears in the portfolio table

## 🚨 Common Issues & Quick Fixes

### "make: command not found"
**Solution**: Use PowerShell scripts or direct Docker commands instead

### "Docker daemon not running"
**Solution**: Start Docker Desktop from Windows Start menu

### "GitHub App not found"
**Solution**: Double-check your App ID in the .env file

### "Invalid private key"
**Solution**: 
- Ensure the .pem file is in the ops directory
- Check the file path in GITHUB_APP_PRIVATE_KEY_PATH
- Re-download the private key if needed

### "Installation not found"
**Solution**: Make sure your GitHub App is installed on your account/organization

### Port already in use
**Solution**: 
```cmd
# Find what's using the port
netstat -ano | findstr :43619
# Kill the process (replace PID)
taskkill /PID <PID> /F
```

## 📋 File Structure Check

Your `ops` directory should look like this:
```
ops/
├── .env                           ← Your configuration
├── .env.example                   ← Template
├── github-app-private-key.pem     ← Your private key
├── docker-compose.yml
├── start.ps1                      ← PowerShell script
├── start.bat                      ← Batch script
└── Makefile
```

## 🎯 Success Indicators

You'll know it's working when:
- ✅ All containers show "Up" status
- ✅ http://localhost:43619/healthz returns `{"status":"ok"}`
- ✅ http://localhost:45937 shows the portfolio dashboard
- ✅ You can successfully add a repository

## 📞 Need Help?

If you get stuck:
1. Check container logs: `docker-compose logs`
2. Review [GitHub App Setup Guide](GITHUB_APP_SETUP.md)
3. Check [Windows Setup Guide](WINDOWS_SETUP.md)
4. Verify your GitHub App permissions and installation

## 🚀 Ready to Go!

Once everything is working:
1. Add your repositories through the web interface
2. Monitor activity and contributor metrics
3. Explore the API documentation at http://localhost:43619/docs

Happy repository tracking! 🎉