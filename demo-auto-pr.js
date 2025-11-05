#!/usr/bin/env node

// Demo script to show auto PR title and description generation
const { execSync } = require('child_process');

// Helper functions (copied from create-pr.js)
function getCommitMessages(sourceBranch, targetBranch) {
  try {
    const commits = execSync(`git log ${targetBranch}..${sourceBranch} --pretty=format:"%s"`, { encoding: 'utf8' });
    return commits.split('\n').filter(msg => msg.trim());
  } catch (error) {
    console.warn('Could not fetch commit messages, using sample data');
    return [
      'feat: enhance PR automation with intelligent title generation',
      'fix: improve error handling in PR creation',
      'docs: add comprehensive documentation and examples',
      'test: add browser compatibility tests'
    ];
  }
}

function getChangedFiles(sourceBranch, targetBranch) {
  try {
    const files = execSync(`git diff --name-only ${targetBranch}..${sourceBranch}`, { encoding: 'utf8' });
    return files.split('\n').filter(file => file.trim());
  } catch (error) {
    console.warn('Could not fetch changed files, using sample data');
    return [
      'scripts/create-pr.js',
      'src/pr-automation.js', 
      'package.json',
      'AUTO-PR-DEMO.md',
      'tests/ai-driven-title.spec.js',
      'tests/test.spec.js'
    ];
  }
}

function getFileStats(sourceBranch, targetBranch) {
  try {
    const stats = execSync(`git diff --stat ${targetBranch}..${sourceBranch}`, { encoding: 'utf8' });
    return stats.trim();
  } catch (error) {
    return '16 files changed, 1083 insertions(+), 8 deletions(-)';
  }
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

function generatePRTitle(commitMessages, changedFiles) {
  if (commitMessages.length === 0) {
    return `Update from current branch`;
  }

  if (commitMessages.length === 1) {
    return commitMessages[0];
  }

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

  if (fileStats) {
    description += `### 📊 Statistics\n\n`;
    description += '```\n' + fileStats + '\n```\n\n';
  }

  description += `### ✅ Automated Checks\n\n`;
  description += `- [ ] Tests pass\n`;
  description += `- [ ] Code quality checks\n`;
  description += `- [ ] Browser compatibility\n`;
  description += `- [ ] Performance validation\n\n`;

  description += `---\n`;
  description += `*This PR was automatically generated with enhanced title and description.*`;

  return description;
}

// Main demo
console.log('🤖 Auto PR Title & Description Generation Demo\n');

const sourceBranch = 'test';
const targetBranch = 'master';

console.log(`Analyzing changes from ${sourceBranch} to ${targetBranch}...\n`);

const commitMessages = getCommitMessages(sourceBranch, targetBranch);
const changedFiles = getChangedFiles(sourceBranch, targetBranch);
const fileStats = getFileStats(sourceBranch, targetBranch);

console.log('📝 Found Commits:');
commitMessages.forEach((msg, i) => console.log(`  ${i + 1}. ${msg}`));

console.log('\n📁 Changed Files:');
changedFiles.forEach(file => console.log(`  - ${file}`));

console.log('\n🏷️  Generated PR Title:');
const title = generatePRTitle(commitMessages, changedFiles);
console.log(`  "${title}"`);

console.log('\n📄 Generated PR Description:');
console.log('----------------------------------------');
const description = generatePRDescription(commitMessages, changedFiles, fileStats, sourceBranch, targetBranch);
console.log(description);
console.log('----------------------------------------');

console.log('\n✅ Demo completed! This is what would be used for automatic PR creation.');