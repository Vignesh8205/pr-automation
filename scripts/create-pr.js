#!/usr/bin/env node

const { PRAutomation } = require('../src/pr-automation');
const { program } = require('commander');
require('dotenv').config();

program
  .requiredOption('-s, --source <branch>', 'Source branch name')
  .option('-t, --target <branch>', 'Target branch name', 'main')
  .option('-r, --repo <repository>', 'Repository name (owner/repo)')
  .option('--title <title>', 'PR title')
  .option('--body <body>', 'PR description')
  .parse();

async function main() {
  try {
    const automation = new PRAutomation();
    const result = await automation.createPR(program.opts());
    
    console.log('PR Created Successfully:');
    console.log(`- Number: #${result.number}`);
    console.log(`- URL: ${result.html_url}`);
    console.log(`- Title: ${result.title}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating PR:', error.message);
    process.exit(1);
  }
}

main();