# Auto PR Generation Demo

This file demonstrates the automatic PR title and description generation feature.

## Features Added

### 🤖 Intelligent Title Generation
- Analyzes commit messages to determine PR type (feat, fix, docs, etc.)
- Identifies affected areas based on changed files
- Generates contextual titles like "Add new features in frontend" or "Fix bugs and issues in tests"

### 📝 Rich Description Generation
- **Commit Summary**: Lists all commits with bullet points
- **File Changes**: Categorizes changed files by type (Frontend, Backend, Tests, etc.)
- **Statistics**: Shows file change statistics from git diff
- **Automated Checks**: Adds checkboxes for common PR requirements

### 🔧 Smart File Categorization
Files are automatically categorized into:
- **Frontend**: .js, .jsx, .ts, .tsx, .vue, .html, .css, .scss
- **Backend**: .py, .java, .go, .rb, .php, .cs, .cpp
- **Tests**: .test.*, .spec.*
- **Documentation**: .md, .txt, .rst  
- **Configuration**: .json, .yaml, .yml, .toml, .ini
- **Scripts**: .sh, .ps1, .bat

## Usage Examples

### Basic Usage (Auto-generated title & description)
```bash
npm run pr:create
```

### Manual Title & Description
```bash
npm run pr:create:manual
node scripts/create-pr.js --title "Custom Title" --body "Custom description"
```

### Custom Options
```bash
node scripts/create-pr.js --source feature-branch --target main --repo owner/repo
```

## Sample Generated Output

### Title Examples
- "Add new features in frontend, tests"
- "Fix bugs and issues in backend" 
- "Update documentation"
- "Refactor code structure in frontend, configuration"

### Description Structure
```markdown
## 🔄 Changes Summary

This PR merges changes from `feature-branch` into `main`.

### 📝 Commits (3)
- feat: add auto PR title generation
- fix: improve error handling
- test: add unit tests for PR automation

### 📁 Files Changed (5)

**Frontend:**
- `scripts/create-pr.js`
- `src/pr-automation.js`

**Configuration:**
- `package.json`

### 📊 Statistics
```
 3 files changed, 150 insertions(+), 20 deletions(-)
```

### ✅ Automated Checks
- [ ] Tests pass
- [ ] Code quality checks  
- [ ] Browser compatibility
- [ ] Performance validation

---
*This PR was automatically generated with enhanced title and description.*
```

## Benefits

1. **Time Saving**: No more manual PR descriptions
2. **Consistency**: Standardized PR format across team
3. **Better Reviews**: Rich context helps reviewers understand changes
4. **Documentation**: Automatic tracking of what changed and why
5. **Flexibility**: Can still override with custom title/description when needed

Try it now with `npm run pr:create`!