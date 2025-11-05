# 🔑 GitHub Personal Access Token Setup Guide

## Why You Need This
The error "Resource not accessible by personal access token" means either:
1. No GitHub token is configured
2. The token doesn't have the right permissions
3. The token is invalid/expired

## Step-by-Step Setup

### 1. Generate a GitHub Personal Access Token

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Profile → Settings → Developer settings → Personal access tokens

2. **Create New Token**
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a descriptive name: "PR Automation Tool"

3. **Required Permissions (Scopes)**
   ✅ **repo** (Full control of private repositories) - **REQUIRED**
   - This includes:
     - repo:status
     - repo_deployment  
     - public_repo
     - repo:invite
     - security_events

   ✅ **workflow** (Update GitHub Action workflows) - **RECOMMENDED**
   
   ✅ **write:packages** (Upload packages to GitHub Package Registry) - **OPTIONAL**

4. **Copy the Token**
   - Click "Generate token"
   - **IMPORTANT**: Copy the token immediately (you won't see it again!)

### 2. Configure Your Environment

1. **Edit the .env file**
   ```bash
   # Replace 'your_github_token_here' with your actual token
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. **Verify Token Permissions**
   Test your token with this command:
   ```bash
   curl -H "Authorization: token YOUR_TOKEN_HERE" https://api.github.com/repos/Vignesh8205/pr-automation
   ```

### 3. Security Best Practices

⚠️ **NEVER commit your .env file to git!**

The `.env` file should already be in `.gitignore`, but double-check:

```bash
# Check if .env is ignored
git status
# .env should NOT appear in the list
```

### 4. Alternative: GitHub CLI Authentication

If you prefer using GitHub CLI:

```bash
# Install GitHub CLI if not already installed
# Then authenticate
gh auth login

# The tool will use GitHub CLI credentials automatically
```

## Testing Your Setup

Once you've added your token to `.env`:

```bash
# Test the PR creation
npm run pr:create

# Or test with custom options
node scripts/create-pr.js --title "Test PR" --body "Testing token setup"
```

## Troubleshooting

### Error: "Bad credentials"
- Token is invalid or expired
- Generate a new token

### Error: "Resource not accessible"  
- Token lacks required permissions
- Regenerate with full **repo** scope

### Error: "Not Found"
- Repository name is incorrect
- Check: `Vignesh8205/pr-automation`

### Error: "Validation Failed"
- Branch doesn't exist on remote
- Push your branch first: `git push origin test`

## Example Working .env File

```bash
# Environment Configuration
GITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyzABCD

# Application URL for testing  
APP_BASE_URL=https://aidrivenslotbookingapp.netlify.app

# Test Configuration
TEST_TIMEOUT=30000
HEADLESS_MODE=true
```

## Quick Fix Commands

```bash
# 1. Create .env file
cp .env.example .env

# 2. Edit .env (add your token)
notepad .env

# 3. Test the setup
npm run pr:create

# 4. If branch not on remote, push it first
git push origin test
```

---

🚀 **Once setup is complete, your auto PR generation will work perfectly!**