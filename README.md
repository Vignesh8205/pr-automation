# 🚀 PR Automation with Playwright

A comprehensive tool for automating Pull Request workflows using Playwright for testing and GitHub/GitLab APIs for PR management.

## ✨ Features

- **Automated PR Creation**: Create PRs with automated checks and validation
- **Intelligent PR Review**: Automated code analysis and review comments
- **Cross-browser Testing**: Run tests on Chromium, Firefox, and WebKit
- **Smart Merge**: Automated merging with pre and post-merge validation
- **CI/CD Integration**: GitHub Actions workflow included
- **Responsive Testing**: Multi-viewport testing for responsive design
- **Accessibility Checks**: Basic accessibility validation
- **Performance Monitoring**: Load time and performance checks

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd pr-automation
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npm run install:browsers
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## 🔧 Configuration

Create a `.env` file with the following variables:

```env
# Required
GITHUB_TOKEN=your_github_personal_access_token

# Optional
APP_BASE_URL=http://localhost:3000
GITLAB_TOKEN=your_gitlab_token
SLACK_WEBHOOK_URL=your_slack_webhook
```

### GitHub Token Setup

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Create a new token with these permissions:
   - `repo` (Full control of private repositories)
   - `pull_requests` (Access pull requests)
   - `checks` (Access checks API)

## 🚀 Usage

### Command Line Interface

#### Create a PR
```bash
node index.js create --source feature-branch --target main --repo owner/repo-name --title "New Feature" --body "Description of changes"
```

#### Review a PR
```bash
node index.js review --pr 123 --repo owner/repo-name
```

#### Merge a PR
```bash
node index.js merge --pr 123 --repo owner/repo-name --method squash
```

#### Run Tests
```bash
node index.js test --url http://localhost:3000 --env dev
```

### NPM Scripts

```bash
# Start interactive mode
npm start

# Run Playwright tests
npm test

# Run tests with headed browsers
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Create PR using script
npm run pr:create

# Review PR using script
npm run pr:review

# Merge PR using script
npm run pr:merge
```

### Programmatic Usage

```javascript
const { PRAutomation } = require('./src/pr-automation');

const automation = new PRAutomation();

// Create PR
await automation.createPR({
  source: 'feature-branch',
  target: 'main',
  repo: 'owner/repo-name',
  title: 'New Feature',
  body: 'Description'
});

// Review PR
await automation.reviewPR({
  pr: 123,
  repo: 'owner/repo-name'
});

// Run tests
await automation.runTests({
  url: 'http://localhost:3000',
  env: 'staging'
});
```

## 🧪 Testing

The tool includes comprehensive Playwright tests that check:

- **Page Load**: Ensures pages load correctly
- **Navigation**: Tests all navigation links
- **Forms**: Validates form functionality
- **Responsive Design**: Tests multiple viewport sizes
- **Performance**: Checks load times and performance metrics
- **Accessibility**: Basic accessibility validation

### Test Configuration

Tests are configured in `playwright.config.js` and can be customized for your needs:

```javascript
// Run specific test file
npx playwright test pr-validation.spec.js

// Run tests in specific browser
npx playwright test --project=chromium

// Run tests with UI
npx playwright test --ui
```

## 📁 Project Structure

```
pr-automation/
├── src/
│   └── pr-automation.js     # Main automation class
├── scripts/
│   ├── create-pr.js         # PR creation script
│   ├── review-pr.js         # PR review script
│   └── merge-pr.js          # PR merge script
├── tests/
│   ├── pr-validation.spec.js # Playwright tests
│   └── global-setup.js      # Test setup
├── .github/
│   └── workflows/
│       └── pr-automation.yml # GitHub Actions workflow
├── playwright.config.js     # Playwright configuration
├── index.js                 # CLI entry point
└── package.json
```

## 🔄 CI/CD Integration

### GitHub Actions

The included GitHub Actions workflow (`.github/workflows/pr-automation.yml`) automatically:

1. Runs on PR creation/updates
2. Performs automated review and testing
3. Auto-merges PRs with `auto-merge` label (if all checks pass)

### GitLab CI

For GitLab integration, create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - review

pr_automation:
  stage: test
  script:
    - npm ci
    - npx playwright install --with-deps
    - npm test
  artifacts:
    reports:
      junit: test-results.xml
    paths:
      - playwright-report/

automated_review:
  stage: review
  script:
    - node index.js review --pr $CI_MERGE_REQUEST_IID --repo $CI_PROJECT_PATH
  only:
    - merge_requests
```

## 🔌 API Integration

### GitHub API Features

- Create, review, and merge PRs
- Access PR files and changes
- Post review comments
- Check CI status
- Manage PR labels and assignees

### GitLab API Features

- Merge request management
- Pipeline integration
- Review comments
- Approval workflows

## 🛠️ Customization

### Adding Custom Tests

Add new tests in the `tests/` directory:

```javascript
// tests/custom-validation.spec.js
import { test, expect } from '@playwright/test';

test('Custom business logic', async ({ page }) => {
  await page.goto('/dashboard');
  // Your custom test logic here
});
```

### Custom Review Rules

Extend the `PRAutomation` class:

```javascript
class CustomPRAutomation extends PRAutomation {
  async analyzeCodeChanges(owner, repo, pr) {
    const analysis = await super.analyzeCodeChanges(owner, repo, pr);
    
    // Add custom analysis logic
    analysis.hasCustomChecks = true;
    
    return analysis;
  }
}
```

## 📊 Reporting

Test results are generated in multiple formats:

- **HTML Report**: `playwright-report/index.html`
- **JSON Report**: `test-results.json`
- **JUnit XML**: `test-results.xml`

## 🐛 Troubleshooting

### Common Issues

1. **Browser Installation**:
   ```bash
   npx playwright install --with-deps
   ```

2. **Permission Errors**:
   - Ensure GitHub token has correct permissions
   - Check repository access rights

3. **Network Timeouts**:
   - Increase timeout in `playwright.config.js`
   - Check application availability

### Debug Mode

Run with debug information:

```bash
DEBUG=pw:api npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a PR

## 📄 License

ISC License - see LICENSE file for details

## 🔗 Links

- [Playwright Documentation](https://playwright.dev)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [GitLab API Documentation](https://docs.gitlab.com/ee/api/)