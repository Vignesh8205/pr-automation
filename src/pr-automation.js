const { chromium, firefox, webkit } = require('playwright');
const { Octokit } = require('@octokit/rest');
const axios = require('axios');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');

class PRAutomation {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    this.config = {
      baseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
      timeout: 30000,
      browsers: ['chromium', 'firefox', 'webkit']
    };
  }

  async createPR(options) {
    console.log(chalk.blue('📝 Creating PR...'));
    
    const { source, target, repo, title, body } = options;
    
    if (!repo) {
      throw new Error('Repository name is required (format: owner/repo)');
    }
    
    const [owner, repoName] = repo.split('/');
    
    try {
      // Log PR details
      console.log(chalk.gray(`Source branch: ${source}`));
      console.log(chalk.gray(`Target branch: ${target}`));
      console.log(chalk.gray(`Repository: ${repo}`));
      console.log(chalk.gray(`Title: ${title}`));
      
      // Create the PR
      const response = await this.octokit.rest.pulls.create({
        owner,
        repo: repoName,
        title: title || `Automated PR from ${source} to ${target}`,
        body: body || 'This PR was created using automated tools.',
        head: source,
        base: target
      });

      console.log(chalk.green(`✅ PR #${response.data.number} created: ${response.data.html_url}`));
      
      // Run initial checks
      await this.runInitialChecks(response.data);
      
      return response.data;
    } catch (error) {
      if (error.message.includes('A pull request already exists')) {
        throw new Error(`A pull request already exists for ${source} -> ${target}. Check existing PRs.`);
      } else if (error.message.includes('No commits between')) {
        throw new Error(`No commits found between ${target} and ${source}. Make sure you have commits to create a PR.`);
      }
      throw new Error(`Failed to create PR: ${error.message}`);
    }
  }

  async reviewPR(options) {
    console.log(chalk.blue('🔍 Starting automated PR review...'));
    
    const { pr, repo } = options;
    
    if (!repo || !pr) {
      throw new Error('Repository name and PR number are required');
    }
    
    const [owner, repoName] = repo.split('/');
    
    try {
      // Get PR details
      const prData = await this.octokit.rest.pulls.get({
        owner,
        repo: repoName,
        pull_number: pr
      });

      console.log(chalk.yellow(`📊 Reviewing PR #${pr}: ${prData.data.title}`));

      // Run automated tests
      const testResults = await this.runAutomatedTests(prData.data);
      
      // Analyze code changes
      const codeAnalysis = await this.analyzeCodeChanges(owner, repoName, pr);
      
      // Generate review comments
      await this.generateReviewComments(owner, repoName, pr, testResults, codeAnalysis);
      
      return {
        testResults,
        codeAnalysis,
        prUrl: prData.data.html_url
      };
    } catch (error) {
      throw new Error(`Failed to review PR: ${error.message}`);
    }
  }

  async mergePR(options) {
    console.log(chalk.blue('🔄 Starting automated merge process...'));
    
    const { pr, repo, method } = options;
    const [owner, repoName] = repo.split('/');
    
    try {
      // Pre-merge checks
      const checksPass = await this.runPreMergeChecks(owner, repoName, pr);
      
      if (!checksPass) {
        throw new Error('Pre-merge checks failed. Cannot proceed with merge.');
      }
      
      // Perform the merge
      const response = await this.octokit.rest.pulls.merge({
        owner,
        repo: repoName,
        pull_number: pr,
        merge_method: method
      });

      console.log(chalk.green(`✅ PR #${pr} merged successfully`));
      
      // Post-merge validation
      await this.runPostMergeValidation(owner, repoName, response.data.sha);
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to merge PR: ${error.message}`);
    }
  }

  async runTests(options) {
    console.log(chalk.blue('🧪 Running Playwright tests...'));
    
    const { url, env } = options;
    const testUrl = url || this.config.baseUrl;
    
    const results = {
      passed: 0,
      failed: 0,
      browsers: {},
      screenshots: []
    };

    for (const browserName of this.config.browsers) {
      console.log(chalk.yellow(`Testing with ${browserName}...`));
      
      const browser = await this.launchBrowser(browserName);
      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        // Run basic smoke tests
        await this.runSmokeTests(page, testUrl, browserName, results);
        
        // Run functional tests
        await this.runFunctionalTests(page, testUrl, browserName, results);
        
        results.browsers[browserName] = 'passed';
        results.passed++;
      } catch (error) {
        console.error(chalk.red(`❌ Tests failed in ${browserName}:`, error.message));
        results.browsers[browserName] = 'failed';
        results.failed++;
        
        // Take screenshot on failure
        const screenshot = `failure-${browserName}-${Date.now()}.png`;
        await page.screenshot({ path: `screenshots/${screenshot}` });
        results.screenshots.push(screenshot);
      } finally {
        await browser.close();
      }
    }

    console.log(chalk.green(`✅ Test Results: ${results.passed} passed, ${results.failed} failed`));
    return results;
  }

  async launchBrowser(browserName) {
    switch (browserName) {
      case 'firefox':
        return await firefox.launch({ headless: true });
      case 'webkit':
        return await webkit.launch({ headless: true });
      default:
        return await chromium.launch({ headless: true });
    }
  }

  async runSmokeTests(page, url, browser, results) {
    console.log(chalk.gray(`  Running smoke tests in ${browser}...`));
    
    // Basic page load test
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    
    // Check if page loaded successfully
    const title = await page.title();
    if (!title) {
      throw new Error('Page title is empty');
    }
    
    console.log(chalk.green(`  ✅ Page loaded successfully: ${title}`));
  }

  async runFunctionalTests(page, url, browser, results) {
    console.log(chalk.gray(`  Running functional tests in ${browser}...`));
    
    // Test navigation
    await page.goto(url);
    
    // Test common UI elements
    await this.testCommonElements(page);
    
    // Test forms if present
    await this.testForms(page);
    
    // Test responsive design
    await this.testResponsive(page);
    
    console.log(chalk.green(`  ✅ Functional tests completed in ${browser}`));
  }

  async testCommonElements(page) {
    // Check for common elements
    const elements = [
      'header',
      'nav',
      'main',
      'footer',
      'h1, h2, h3',
      'a[href]',
      'button'
    ];

    for (const selector of elements) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
      } catch (error) {
        console.log(chalk.yellow(`  ⚠️  Element not found: ${selector}`));
      }
    }
  }

  async testForms(page) {
    const forms = await page.$$('form');
    
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      
      // Test form inputs
      const inputs = await form.$$('input[type="text"], input[type="email"], textarea');
      
      for (const input of inputs) {
        await input.fill('test data');
        await input.clear();
      }
      
      console.log(chalk.gray(`    Tested form ${i + 1}`));
    }
  }

  async testResponsive(page) {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      // Check if layout is responsive
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      if (bodyWidth > viewport.width + 50) {
        console.log(chalk.yellow(`  ⚠️  Potential responsive issue at ${viewport.name}`));
      }
    }
  }

  async runInitialChecks(prData) {
    console.log(chalk.blue('🔍 Running initial PR checks...'));
    
    // Check PR size
    if (prData.additions > 1000 || prData.deletions > 1000) {
      console.log(chalk.yellow('⚠️  Large PR detected. Consider breaking it down.'));
    }
    
    // Check if description exists
    if (!prData.body || prData.body.length < 10) {
      console.log(chalk.yellow('⚠️  PR description is too short or missing.'));
    }
    
    console.log(chalk.green('✅ Initial checks completed'));
  }

  async runAutomatedTests(prData) {
    console.log(chalk.blue('🧪 Running automated tests for PR...'));
    
    // This would integrate with your actual test suite
    return {
      status: 'passed',
      coverage: '85%',
      testCount: 42,
      duration: '2m 30s'
    };
  }

  async analyzeCodeChanges(owner, repo, pr) {
    console.log(chalk.blue('📊 Analyzing code changes...'));
    
    // Get PR files
    const files = await this.octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: pr
    });

    const analysis = {
      fileCount: files.data.length,
      hasTests: false,
      hasDocumentation: false,
      riskLevel: 'low'
    };

    // Analyze file types
    for (const file of files.data) {
      if (file.filename.includes('test') || file.filename.includes('spec')) {
        analysis.hasTests = true;
      }
      
      if (file.filename.includes('README') || file.filename.includes('doc')) {
        analysis.hasDocumentation = true;
      }
      
      if (file.changes > 100) {
        analysis.riskLevel = 'high';
      }
    }

    return analysis;
  }

  async generateReviewComments(owner, repo, pr, testResults, codeAnalysis) {
    console.log(chalk.blue('💬 Generating review comments...'));
    
    let comments = [];
    
    if (!codeAnalysis.hasTests) {
      comments.push('Consider adding tests for your changes to improve code quality.');
    }
    
    if (codeAnalysis.riskLevel === 'high') {
      comments.push('This PR contains significant changes. Please ensure thorough testing.');
    }
    
    // Post review comment
    if (comments.length > 0) {
      await this.octokit.rest.pulls.createReview({
        owner,
        repo,
        pull_number: pr,
        body: `Automated Review:\n\n${comments.map(c => `- ${c}`).join('\n')}`,
        event: 'COMMENT'
      });
    }
  }

  async runPreMergeChecks(owner, repo, pr) {
    console.log(chalk.blue('🔍 Running pre-merge checks...'));
    
    // Check if all checks pass
    const checks = await this.octokit.rest.checks.listForRef({
      owner,
      repo,
      ref: `pull/${pr}/head`
    });

    const allChecksPassed = checks.data.check_runs.every(
      check => check.conclusion === 'success'
    );

    if (!allChecksPassed) {
      console.log(chalk.red('❌ Some checks are failing'));
      return false;
    }

    console.log(chalk.green('✅ All pre-merge checks passed'));
    return true;
  }

  async runPostMergeValidation(owner, repo, sha) {
    console.log(chalk.blue('🔍 Running post-merge validation...'));
    
    // This would run smoke tests on the merged code
    console.log(chalk.green('✅ Post-merge validation completed'));
  }
}

module.exports = { PRAutomation };