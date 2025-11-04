#!/usr/bin/env node

const { PRAutomation } = require('../src/pr-automation');
const { program } = require('commander');
require('dotenv').config();

program
  .requiredOption('-p, --pr <number>', 'PR number to review')
  .requiredOption('-r, --repo <repository>', 'Repository name (owner/repo)')
  .parse();

async function main() {
  try {
    const automation = new PRAutomation();
    const result = await automation.reviewPR(program.opts());
    
    console.log('PR Review Results:');
    console.log(`- Test Status: ${result.testResults.status}`);
    console.log(`- Coverage: ${result.testResults.coverage}`);
    console.log(`- File Count: ${result.codeAnalysis.fileCount}`);
    console.log(`- Risk Level: ${result.codeAnalysis.riskLevel}`);
    console.log(`- Has Tests: ${result.codeAnalysis.hasTests}`);
    console.log(`- PR URL: ${result.prUrl}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error reviewing PR:', error.message);
    process.exit(1);
  }
}

main();