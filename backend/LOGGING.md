# Application Logging System

## Overview
The application uses a centralized logging system that tracks all operations and writes to daily log files.

## Log File Location
- **Directory**: `backend/logs/`
- **Format**: `YYYY-MM-DD.log` (e.g., `2025-01-15.log`)
- **New file created automatically** for each day

## Log Entry Format
```
[YYYY-MM-DD HH:MM:SS] [LEVEL] Message | Data: {json}
```

Example:
```
[2025-01-15 14:30:45] [INFO] HR login attempt | Data: {"username":"admin"}
[2025-01-15 14:30:46] [SUCCESS] HR login successful | Data: {"username":"admin","sessionId":"Generated"}
```

## Log Levels
- **INFO**: General information about operations
- **SUCCESS**: Successful completion of operations
- **WARNING**: Non-critical issues or validation failures
- **ERROR**: Errors and failures

## What Gets Logged

### 1. Authentication
- CSRF token generation
- HR login attempts (success/failure)
- BioStar API authentication

### 2. Employee Operations
- Employee list fetching from BioStar
- Total employees retrieved

### 3. Email Operations
- Verification email requests
- Email sending success/failure
- Employee ID and email address

### 4. Photo Upload & Face Registration
- Photo upload requests
- BioStar login for face update
- Face data update in BioStar
- Image validation errors

### 5. Server Operations
- Server startup
- Database connection status
- Port information

## Usage in Code

```javascript
const logger = require('./utils/logger');

// Log information
logger.info('Operation started', { userId: '123' });

// Log success
logger.success('Operation completed', { result: 'data' });

// Log warning
logger.warning('Validation issue', { field: 'email' });

// Log error
logger.error('Operation failed', { error: error.message });
```

## Log File Management
- Each day creates a new log file automatically
- Old log files are preserved
- Logs are also printed to console during development

## Security Notes
- Passwords are NOT logged
- Only usernames and IDs are logged for tracking
- Session IDs are logged as 'Generated' (not actual value)
- Email addresses are logged for verification tracking
