#!/usr/bin/env node

const { PRAutomation } = require('../src/pr-automation');
const { program } = require('commander');
const { execSync } = require('child_process');
require('dotenv').config();

// Helper function to get repository name from git remote
function getRepositoryName() {
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const match = remoteUrl.match(/github\.com[:/](.+?)(?:\.git)?$/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

// Helper function to get the most recent PR number for current branch
async function getLatestPRNumber(repo, branch) {
  try {
    const { Octokit } = require('@octokit/rest');
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    
    const [owner, repoName] = repo.split('/');
    
    // Get PRs for the current branch
    const { data: prs } = await octokit.rest.pulls.list({
      owner,
      repo: repoName,
      head: `${owner}:${branch}`,
      state: 'open',
      sort: 'created',
      direction: 'desc',
      per_page: 1
    });
    
    if (prs.length > 0) {
      return prs[0].number;
    }
    
    return null;
  } catch (error) {
    console.warn('Could not auto-detect PR number:', error.message);
    return null;
  }
}

const repoName = getRepositoryName();

program
  .option('-p, --pr <number>', 'PR number to review (auto-detected if not provided)')
  .option('-r, --repo <repository>', 'Repository name (owner/repo)', repoName)
  .option('-b, --branch <branch>', 'Branch to find PR for (defaults to current branch)')
  .parse();

async function main() {
  try {
    const opts = program.opts();
    
    // Validate repository
    if (!opts.repo) {
      console.error('Error: Repository name is required (format: owner/repo).');
      console.error('Could not auto-detect repository from git remote.');
      process.exit(1);
    }
    
    // Auto-detect PR number if not provided
    if (!opts.pr) {
      console.log('🔍 Auto-detecting PR number...');
      
      const currentBranch = opts.branch || (() => {
        try {
          return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        } catch {
          return null;
        }
      })();
      
      if (!currentBranch) {
        console.error('Error: Could not detect current branch. Please specify PR number with -p option.');
        process.exit(1);
      }
      
      console.log(`Looking for open PRs from branch: ${currentBranch}`);
      
      const prNumber = await getLatestPRNumber(opts.repo, currentBranch);
      
      if (!prNumber) {
        console.error(`Error: No open PR found for branch '${currentBranch}' in ${opts.repo}`);
        console.error('Please specify PR number with -p option, or create a PR first.');
        process.exit(1);
      }
      
      opts.pr = prNumber;
      console.log(`✅ Found PR #${prNumber}`);
    }
    
    console.log(`\n🔍 Reviewing PR #${opts.pr} in ${opts.repo}...`);
    
    const automation = new PRAutomation();
    const result = await automation.reviewPR(opts);
    
    console.log('\n📊 PR Review Results:');
    console.log('════════════════════════════════════════');
    console.log(`🔗 PR URL: ${result.prUrl}`);
    console.log(`\n🧪 Test Results:`);
    console.log(`   Status: ${result.testResults.status}`);
    console.log(`   Coverage: ${result.testResults.coverage}`);
    console.log(`   Test Count: ${result.testResults.testCount}`);
    console.log(`   Duration: ${result.testResults.duration}`);
    
    console.log(`\n📁 Code Analysis:`);
    console.log(`   Files Changed: ${result.codeAnalysis.fileCount}`);
    console.log(`   Risk Level: ${result.codeAnalysis.riskLevel}`);
    console.log(`   Has Tests: ${result.codeAnalysis.hasTests ? '✅' : '❌'}`);
    console.log(`   Has Documentation: ${result.codeAnalysis.hasDocumentation ? '✅' : '❌'}`);
    
    // Provide recommendations
    console.log(`\n💡 Recommendations:`);
    if (!result.codeAnalysis.hasTests) {
      console.log(`   ⚠️  Consider adding tests for your changes`);
    }
    if (!result.codeAnalysis.hasDocumentation) {
      console.log(`   📝 Consider updating documentation`);
    }
    if (result.codeAnalysis.riskLevel === 'high') {
      console.log(`   🚨 High risk changes detected - ensure thorough testing`);
    }
    if (result.codeAnalysis.riskLevel === 'low' && result.codeAnalysis.hasTests) {
      console.log(`   ✅ Looks good! Low risk with tests included`);
    }
    
    console.log('\n════════════════════════════════════════');
    
    process.exit(0);
  } catch (error) {
    console.error('Error reviewing PR:', error.message);
    process.exit(1);
  }
}

main();