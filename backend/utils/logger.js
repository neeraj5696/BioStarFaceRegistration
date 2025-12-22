const fs = require('fs');
const path = require('path');

class AppLogger {
  constructor() {
    // When packaged with pkg, __dirname points to the read-only snapshot.
    // Use the executable's directory instead so logs can be written.
    const baseDir = process.pkg ? path.dirname(process.execPath) : path.join(__dirname, '..');
    this.logsDir = path.join(baseDir, 'logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  getDailyFolder() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dailyFolder = path.join(this.logsDir, `${year}-${month}-${day}`);
    
    if (!fs.existsSync(dailyFolder)) {
      fs.mkdirSync(dailyFolder, { recursive: true });
    }
    
    return dailyFolder;
  }

  getLogFileName() {
    return 'activity.log';
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
    const dailyFolder = this.getDailyFolder();
    const logFileName = this.getLogFileName();
    const logFilePath = path.join(dailyFolder, logFileName);
    
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

  // Specific activity logging methods
  logUserListFetched(count, username = null) {
    const message = `User list fetched successfully`;
    const data = {
      totalUsers: count,
      username: username || 'System'
    };
    this.success(message, data);
  }

  logEmailSent(employeeCount, employeeNames = []) {
    const message = `Verification email sent to ${employeeCount} employee(s)`;
    const data = {
      count: employeeCount,
      employees: employeeNames.map(emp => ({
        id: emp.id || emp.employeeId,
        name: emp.name,
        email: emp.email
      }))
    };
    this.success(message, data);
  }

  logPhotoReceived(userId, userName, email = null) {
    const message = `Photo received from user`;
    const data = {
      userId: userId,
      userName: userName,
      email: email
    };
    this.info(message, data);
  }

  logPhotoSubmitted(userId, userName, email = null) {
    const message = `Photo submitted by user`;
    const data = {
      userId: userId,
      userName: userName,
      email: email
    };
    this.info(message, data);
  }

  logPhotoUpdated(userId, userName, email = null) {
    const message = `Photo updated successfully`;
    const data = {
      userId: userId,
      userName: userName,
      email: email
    };
    this.success(message, data);
  }

  logLoginSuccess(username) {
    const message = `Login successful`;
    const data = {
      username: username
    };
    this.success(message, data);
  }
}

module.exports = new AppLogger();