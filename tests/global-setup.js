async function globalSetup(config) {
  console.log('🚀 Setting up test environment...');
  
  // Create necessary directories
  const fs = require('fs').promises;
  const path = require('path');
  
  const dirs = [
    'screenshots',
    'test-results',
    'reports'
  ];
  
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }
  
  console.log('✅ Test environment setup complete');
}

module.exports = globalSetup;