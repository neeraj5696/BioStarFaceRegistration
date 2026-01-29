// const rawBackendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
// const Backend_URL = rawBackendUrl
//   ? /^(https?:\/\/)/i.test(rawBackendUrl)
//     ? rawBackendUrl
//     : `http://${rawBackendUrl}`
//   : "";

// interface LogData {
//   [key: string]: any;
// }

// class FrontendLogger {
//   private async logToBackend(level: string, message: string, data: LogData | null = null) {
//     try {
//       // Reduce payload size for large data
//       let processedData = data;
//       if (data && data.employees && Array.isArray(data.employees)) {
//         // Limit employee data to prevent large payloads
//         processedData = {
//           ...data,
//           employees: data.employees.length > 50 
//             ? data.employees.slice(0, 50).concat([{ note: `... and ${data.employees.length - 50} more employees` }])
//             : data.employees
//         };
//       }

//       const response = await fetch(`${Backend_URL}/api/log`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           level,
//           message,
//           data: processedData,
//           timestamp: new Date().toISOString(),
//           userAgent: navigator.userAgent,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       const result = await response.json();
//       if (!result.success) {
//         throw new Error(result.error || 'Unknown backend error');
//       }

//     } catch (error) {
//       // Log to console for debugging but don't interrupt user experience
//       console.error('[LOGGER] Failed to send log to backend:', {
//         error: error instanceof Error ? error.message : String(error),
//         level,
//         message,
//         dataSize: data ? JSON.stringify(data).length : 0
//       });
      
//       // Store failed logs in localStorage for retry later
//       try {
//         const failedLogs = JSON.parse(localStorage.getItem('failedLogs') || '[]');
//         failedLogs.push({
//           level,
//           message,
//           data: processedData,
//           timestamp: new Date().toISOString(),
//           error: error instanceof Error ? error.message : String(error)
//         });
        
//         // Keep only last 10 failed logs
//         if (failedLogs.length > 10) {
//           failedLogs.splice(0, failedLogs.length - 10);
//         }
        
//         localStorage.setItem('failedLogs', JSON.stringify(failedLogs));
//       } catch (storageError) {
//         console.error('[LOGGER] Failed to store failed log:', storageError);
//       }
//     }
//   }

//   info(message: string, data: LogData | null = null) {
//     console.log(`[INFO] ${message}`, data);
//     this.logToBackend('INFO', message, data);
//   }

//   success(message: string, data: LogData | null = null) {
//     console.log(`[SUCCESS] ${message}`, data);
//     this.logToBackend('SUCCESS', message, data);
//   }

//   error(message: string, data: LogData | null = null) {
//     console.error(`[ERROR] ${message}`, data);
//     this.logToBackend('ERROR', message, data);
//   }

//   warning(message: string, data: LogData | null = null) {
//     console.warn(`[WARNING] ${message}`, data);
//     this.logToBackend('WARNING', message, data);
//   }

//   // Specific activity logging methods
//   logUserListFetched(count: number) {
//     const message = `User list fetched from frontend`;
//     const data = {
//       totalUsers: count,
//       source: 'frontend'
//     };
//     this.success(message, data);
//   }

//   logEmailsSent(employeeCount: number, employeeNames: Array<{ id: string; name: string; email: string }>) {
//     const message = `Verification emails sent to ${employeeCount} employee(s) from frontend`;
//     const data = {
//       count: employeeCount,
//       employees: employeeNames,
//       source: 'frontend'
//     };
//     this.success(message, data);
//   }

//   logPhotoSubmitted(userId: string, userName: string, email: string | null = null) {
//     const message = `Photo submitted from frontend`;
//     const data = {
//       userId: userId,
//       userName: userName,
//       email: email,
//       source: 'frontend'
//     };
//     this.info(message, data);
//   }

//   logPhotoFailed(
//     userId: string,
//     userName: string,
//     email: string | null = null,
//     errorData: any = null,
//     status?: number
//   ) {
//     const message = `Photo upload failed from frontend`;
//     const data = {
//       userId,
//       userName,
//       email,
//       status,
//       error: errorData,
//       source: 'frontend'
//     };
//     this.error(message, data);
//   }
// }

// export default new FrontendLogger();
