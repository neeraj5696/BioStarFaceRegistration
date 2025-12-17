// Test script to demonstrate the logger functionality
const logger = require('./utils/logger');

console.log('\n=== Testing Application Logger ===\n');

// Test different log levels
logger.info('Application logger test started');
logger.info('Testing INFO level', { testData: 'sample info' });

logger.success('Testing SUCCESS level', { operation: 'completed', duration: '2s' });

logger.warning('Testing WARNING level', { issue: 'validation failed', field: 'email' });

logger.error('Testing ERROR level', { error: 'Connection timeout', code: 'ETIMEDOUT' });

logger.info('Logger test completed');

console.log('\n=== Check the log file in backend/logs/ directory ===\n');
console.log(`Log file: ${new Date().toISOString().split('T')[0]}.log`);
