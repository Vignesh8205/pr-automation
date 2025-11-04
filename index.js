#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const { PRAutomation } = require('./src/pr-automation');
require('dotenv').config();

program
  .name('pr-automation')
  .description('Playwright-based PR automation tool')
  .version('1.0.0');

program
  .command('create')
  .description('Create a new PR with automated checks')
  .option('-s, --source <branch>', 'Source branch name')
  .option('-t, --target <branch>', 'Target branch name', 'main')
  .option('-r, --repo <repository>', 'Repository name (owner/repo)')
  .option('--title <title>', 'PR title')
  .option('--body <body>', 'PR description')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🚀 Creating PR with automation...'));
      const automation = new PRAutomation();
      await automation.createPR(options);
      console.log(chalk.green('✅ PR created successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Error creating PR:'), error.message);
      process.exit(1);
    }
  });

program
  .command('review')
  .description('Automated PR review and testing')
  .option('-p, --pr <number>', 'PR number to review')
  .option('-r, --repo <repository>', 'Repository name (owner/repo)')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🔍 Starting automated PR review...'));
      const automation = new PRAutomation();
      await automation.reviewPR(options);
      console.log(chalk.green('✅ PR review completed!'));
    } catch (error) {
      console.error(chalk.red('❌ Error reviewing PR:'), error.message);
      process.exit(1);
    }
  });

program
  .command('merge')
  .description('Automated PR merge with checks')
  .option('-p, --pr <number>', 'PR number to merge')
  .option('-r, --repo <repository>', 'Repository name (owner/repo)')
  .option('-m, --method <method>', 'Merge method (merge|squash|rebase)', 'merge')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🔄 Starting automated PR merge...'));
      const automation = new PRAutomation();
      await automation.mergePR(options);
      console.log(chalk.green('✅ PR merged successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Error merging PR:'), error.message);
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Run Playwright tests for PR validation')
  .option('-u, --url <url>', 'Application URL to test')
  .option('-e, --env <environment>', 'Environment (dev|staging|prod)', 'dev')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🧪 Running Playwright tests...'));
      const automation = new PRAutomation();
      await automation.runTests(options);
      console.log(chalk.green('✅ Tests completed!'));
    } catch (error) {
      console.error(chalk.red('❌ Error running tests:'), error.message);
      process.exit(1);
    }
  });

// Interactive mode
if (process.argv.length === 2) {
  console.log(chalk.cyan(`
╔══════════════════════════════════════════╗
║          PR Automation Tool              ║
║         Powered by Playwright            ║
╚══════════════════════════════════════════╝
  `));
  
  console.log(chalk.yellow('Available commands:'));
  console.log(chalk.white('  create  - Create a new PR with automated checks'));
  console.log(chalk.white('  review  - Automated PR review and testing'));
  console.log(chalk.white('  merge   - Automated PR merge with checks'));
  console.log(chalk.white('  test    - Run Playwright tests for PR validation'));
  console.log(chalk.gray('\nUse --help with any command for more options'));
}

program.parse();