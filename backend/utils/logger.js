const fs = require('fs');
const path = require('path');

class AppLogger {
  constructor() {
    this.logsDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  getLogFileName() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}.log`;
  }

  getTimestamp() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  writeLog(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const logFileName = this.getLogFileName();
    const logFilePath = path.join(this.logsDir, logFileName);
    
    let logMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      logMessage += ` | Data: ${JSON.stringify(data)}`;
    }
    
    logMessage += '\n';

    fs.appendFileSync(logFilePath, logMessage, 'utf8');
    
    // Also log to console for development
    console.log(logMessage.trim());
  }

  info(message, data = null) {
    this.writeLog('INFO', message, data);
  }

  success(message, data = null) {
    this.writeLog('SUCCESS', message, data);
  }

  error(message, data = null) {
    this.writeLog('ERROR', message, data);
  }

  warning(message, data = null) {
    this.writeLog('WARNING', message, data);
  }
}

module.exports = new AppLogger();
