#!/usr/bin/env node

const { PRAutomation } = require('../src/pr-automation');
const { program } = require('commander');
const { execSync } = require('child_process');
require('dotenv').config();

// Helper function to get current git branch
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

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

// Helper function to get commit messages since target branch
function getCommitMessages(sourceBranch, targetBranch) {
  try {
    const commits = execSync(`git log ${targetBranch}..${sourceBranch} --pretty=format:"%s"`, { encoding: 'utf8' });
    return commits.split('\n').filter(msg => msg.trim());
  } catch (error) {
    console.warn('Could not fetch commit messages:', error.message);
    return [];
  }
}

// Helper function to get changed files
function getChangedFiles(sourceBranch, targetBranch) {
  try {
    const files = execSync(`git diff --name-only ${targetBranch}..${sourceBranch}`, { encoding: 'utf8' });
    return files.split('\n').filter(file => file.trim());
  } catch (error) {
    console.warn('Could not fetch changed files:', error.message);
    return [];
  }
}

// Helper function to get file stats
function getFileStats(sourceBranch, targetBranch) {
  try {
    const stats = execSync(`git diff --stat ${targetBranch}..${sourceBranch}`, { encoding: 'utf8' });
    return stats.trim();
  } catch (error) {
    return '';
  }
}

// AI-powered title and description generation
function generatePRTitle(commitMessages, changedFiles) {
  if (commitMessages.length === 0) {
    return `Update from ${getCurrentBranch()}`;
  }

  // If single commit, use it as title
  if (commitMessages.length === 1) {
    return commitMessages[0];
  }

  // Analyze commit patterns
  const patterns = {
    feat: /^(feat|feature)/i,
    fix: /^(fix|bugfix)/i,
    docs: /^(docs|documentation)/i,
    style: /^(style|formatting)/i,
    refactor: /^(refactor|refactoring)/i,
    test: /^(test|tests)/i,
    chore: /^(chore|maintenance)/i
  };

  const commitTypes = commitMessages.map(msg => {
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(msg)) return type;
    }
    return 'update';
  });

  const mostCommonType = commitTypes.reduce((a, b, i, arr) =>
    arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
  );

  // Generate title based on most common type
  const typeLabels = {
    feat: 'Add new features',
    fix: 'Fix bugs and issues',
    docs: 'Update documentation',
    style: 'Improve styling and formatting',
    refactor: 'Refactor code structure',
    test: 'Add and update tests',
    chore: 'Maintenance and cleanup',
    update: 'Update codebase'
  };

  const affectedAreas = categorizeFiles(changedFiles);
  const areaText = affectedAreas.length > 0 ? ` in ${affectedAreas.join(', ')}` : '';

  return `${typeLabels[mostCommonType]}${areaText}`;
}

function generatePRDescription(commitMessages, changedFiles, fileStats, sourceBranch, targetBranch) {
  let description = `## 🔄 Changes Summary\n\n`;
  description += `This PR merges changes from \`${sourceBranch}\` into \`${targetBranch}\`.\n\n`;

  // Commit summary
  if (commitMessages.length > 0) {
    description += `### 📝 Commits (${commitMessages.length})\n\n`;
    commitMessages.slice(0, 10).forEach(msg => {
      description += `- ${msg}\n`;
    });
    if (commitMessages.length > 10) {
      description += `- ... and ${commitMessages.length - 10} more commits\n`;
    }
    description += '\n';
  }

  // File changes
  if (changedFiles.length > 0) {
    description += `### 📁 Files Changed (${changedFiles.length})\n\n`;
    
    const categorizedFiles = categorizeFilesDetailed(changedFiles);
    
    Object.entries(categorizedFiles).forEach(([category, files]) => {
      if (files.length > 0) {
        description += `**${category}:**\n`;
        files.slice(0, 5).forEach(file => {
          description += `- \`${file}\`\n`;
        });
        if (files.length > 5) {
          description += `- ... and ${files.length - 5} more files\n`;
        }
        description += '\n';
      }
    });
  }

  // Statistics
  if (fileStats) {
    description += `### 📊 Statistics\n\n`;
    description += '```\n' + fileStats + '\n```\n\n';
  }

  // Automated checks
  description += `### ✅ Automated Checks\n\n`;
  description += `- [ ] Tests pass\n`;
  description += `- [ ] Code quality checks\n`;
  description += `- [ ] Browser compatibility\n`;
  description += `- [ ] Performance validation\n\n`;

  description += `---\n`;
  description += `*This PR was automatically generated with enhanced title and description.*`;

  return description;
}

function categorizeFiles(files) {
  const categories = [];
  const patterns = {
    'frontend': /\.(js|jsx|ts|tsx|vue|svelte|html|css|scss|sass)$/i,
    'backend': /\.(py|java|go|rb|php|cs|cpp|c)$/i,
    'tests': /\.(test|spec)\./i,
    'docs': /\.(md|txt|rst)$/i,
    'config': /\.(json|yaml|yml|toml|ini|conf)$/i,
    'scripts': /\.(sh|ps1|bat)$/i
  };

  for (const [category, pattern] of Object.entries(patterns)) {
    if (files.some(file => pattern.test(file))) {
      categories.push(category);
    }
  }

  return categories;
}

function categorizeFilesDetailed(files) {
  const categories = {
    'Frontend': [],
    'Backend': [],
    'Tests': [],
    'Documentation': [],
    'Configuration': [],
    'Scripts': [],
    'Other': []
  };

  const patterns = {
    'Frontend': /\.(js|jsx|ts|tsx|vue|svelte|html|css|scss|sass)$/i,
    'Backend': /\.(py|java|go|rb|php|cs|cpp|c)$/i,
    'Tests': /\.(test|spec)\./i,
    'Documentation': /\.(md|txt|rst)$/i,
    'Configuration': /\.(json|yaml|yml|toml|ini|conf)$/i,
    'Scripts': /\.(sh|ps1|bat)$/i
  };

  files.forEach(file => {
    let categorized = false;
    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(file)) {
        categories[category].push(file);
        categorized = true;
        break;
      }
    }
    if (!categorized) {
      categories['Other'].push(file);
    }
  });

  return categories;
}

const currentBranch = getCurrentBranch();
const repoName = getRepositoryName();

program
  .option('-s, --source <branch>', 'Source branch name', currentBranch)
  .option('-t, --target <branch>', 'Target branch name', 'master')
  .option('-r, --repo <repository>', 'Repository name (owner/repo)', repoName)
  .option('--title <title>', 'PR title (auto-generated if not provided)')
  .option('--body <body>', 'PR description (auto-generated if not provided)')
  .option('--no-auto', 'Disable auto-generation of title and description')
  .parse();

async function main() {
  try {
    const opts = program.opts();
    
    // Validate required options
    if (!opts.source) {
      console.error('Error: Source branch is required. Current branch could not be detected.');
      process.exit(1);
    }
    
    if (!opts.repo) {
      console.error('Error: Repository name is required (format: owner/repo).');
      process.exit(1);
    }
    
    console.log(`Creating PR from ${opts.source} to ${opts.target} in ${opts.repo}...`);
    
    // Auto-generate title and description if not provided and auto is enabled
    if (opts.auto !== false) {
      console.log('🤖 Generating intelligent PR title and description...');
      
      const commitMessages = getCommitMessages(opts.source, opts.target);
      const changedFiles = getChangedFiles(opts.source, opts.target);
      const fileStats = getFileStats(opts.source, opts.target);
      
      if (!opts.title && commitMessages.length > 0) {
        opts.title = generatePRTitle(commitMessages, changedFiles);
        console.log(`📝 Generated title: "${opts.title}"`);
      }
      
      if (!opts.body) {
        opts.body = generatePRDescription(commitMessages, changedFiles, fileStats, opts.source, opts.target);
        console.log('📄 Generated detailed description with commit history and file changes');
      }
    }
    
    // Fallback to default title/description if still not provided
    if (!opts.title) {
      opts.title = `Automated PR from ${opts.source} to ${opts.target}`;
    }
    
    if (!opts.body) {
      opts.body = 'This PR was created using automated tools.';
    }
    
    const automation = new PRAutomation();
    const result = await automation.createPR(opts);
    
    console.log('\n✅ PR Created Successfully:');
    console.log(`- Number: #${result.number}`);
    console.log(`- URL: ${result.html_url}`);
    console.log(`- Title: ${result.title}`);
    console.log(`- Description: ${result.body?.substring(0, 100)}...`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating PR:', error.message);
    process.exit(1);
  }
}

main();