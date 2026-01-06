// const rawBackendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
// const Backend_URL = rawBackendUrl
//   ? /^(https?:\/\/)/i.test(rawBackendUrl)
//     ? rawBackendUrl
//     : `http://${rawBackendUrl}`
//   : "";

interface LogData {
  [key: string]: any;
}

class FrontendLogger {
  private logToBackend(level: string, message: string, data: LogData | null = null) {
    // Send log to backend API endpoint
    fetch(`/api/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        level,
        message,
        data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }),
    }).catch((error) => {
      // Silently fail - don't interrupt user experience
      console.error('Failed to send log to backend:', error);
    });
  }

  info(message: string, data: LogData | null = null) {
    console.log(`[INFO] ${message}`, data);
    this.logToBackend('INFO', message, data);
  }

  success(message: string, data: LogData | null = null) {
    console.log(`[SUCCESS] ${message}`, data);
    this.logToBackend('SUCCESS', message, data);
  }

  error(message: string, data: LogData | null = null) {
    console.error(`[ERROR] ${message}`, data);
    this.logToBackend('ERROR', message, data);
  }

  warning(message: string, data: LogData | null = null) {
    console.warn(`[WARNING] ${message}`, data);
    this.logToBackend('WARNING', message, data);
  }

  // Specific activity logging methods
  logUserListFetched(count: number) {
    const message = `User list fetched from frontend`;
    const data = {
      totalUsers: count,
      source: 'frontend'
    };
    this.success(message, data);
  }

  logEmailsSent(employeeCount: number, employeeNames: Array<{ id: string; name: string; email: string }>) {
    const message = `Verification emails sent to ${employeeCount} employee(s) from frontend`;
    const data = {
      count: employeeCount,
      employees: employeeNames,
      source: 'frontend'
    };
    this.success(message, data);
  }

  logPhotoSubmitted(userId: string, userName: string, email: string | null = null) {
    const message = `Photo submitted from frontend`;
    const data = {
      userId: userId,
      userName: userName,
      email: email,
      source: 'frontend'
    };
    this.info(message, data);
  }

  logPhotoFailed(
    userId: string,
    userName: string,
    email: string | null = null,
    errorData: any = null,
    status?: number
  ) {
    const message = `Photo upload failed from frontend`;
    const data = {
      userId,
      userName,
      email,
      status,
      error: errorData,
      source: 'frontend'
    };
    this.error(message, data);
  }
}

export default new FrontendLogger();
