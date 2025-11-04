#!/usr/bin/env node

const { PRAutomation } = require('../src/pr-automation');
const { program } = require('commander');
require('dotenv').config();

program
  .requiredOption('-p, --pr <number>', 'PR number to merge')
  .requiredOption('-r, --repo <repository>', 'Repository name (owner/repo)')
  .option('-m, --method <method>', 'Merge method (merge|squash|rebase)', 'merge')
  .parse();

async function main() {
  try {
    const automation = new PRAutomation();
    const result = await automation.mergePR(program.opts());
    
    console.log('PR Merged Successfully:');
    console.log(`- SHA: ${result.sha}`);
    console.log(`- Message: ${result.message}`);
    console.log(`- Merged: ${result.merged}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error merging PR:', error.message);
    process.exit(1);
  }
}

main();