import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Employee {
  id: string;
  name: string;
  email: string;
}

interface BulkEmailSenderProps {
  employees: Employee[];
  onClose: () => void;
  filterType: 'all' | 'id10plus';
}

// const rawBackendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
// const Backend_URL = rawBackendUrl
//   ? /^(https?:\/\/)/i.test(rawBackendUrl)
//     ? rawBackendUrl
//     : `http://${rawBackendUrl}`
//   : "";

const BulkEmailSender: React.FC<BulkEmailSenderProps> = ({ employees, onClose, filterType }) => {
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    if (!email || email.trim() === '') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const filteredEmployees = filterType === 'id10plus' 
    ? employees.filter(emp => emp.id.length >= 10 && isValidEmail(emp.email))
    : employees.filter(emp => isValidEmail(emp.email));

  const invalidEmailCount = employees.length - filteredEmployees.length;

  const handleBulkSend = async () => {

    toast.success(`Bulk Mail Sender Triggered, Please wait..., do not refresh the page`);


    if (filteredEmployees.length === 0) {
      toast.error("No employees to send emails to");
      return;
    }

    setSending(true);
    setProgress(0);
    setSuccessCount(0);
    setFailCount(0);

    const BATCH_SIZE = 200; // Send 200 emails per batch
    const batches = Math.ceil(filteredEmployees.length / BATCH_SIZE);
    setTotalBatches(batches);

    let success = 0;
    let fail = 0;

    for (let i = 0; i < batches; i++) {
      setCurrentBatch(i + 1);
      const batch = filteredEmployees.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

      try {
       // const response = await axios.post(`${Backend_URL}/api/send-bulk-email`, {
         const response = await axios.post(`/api/send-bulk-email`, {
          employees: batch.map(emp => ({
            id: emp.id,
            name: emp.name,
            email: emp.email
          }))
        });
        
        success += response.data.success || batch.length;
        fail += response.data.failed || 0;
        setSuccessCount(success);
        setFailCount(fail);
      } catch (error) {
        fail += batch.length;
        setFailCount(fail);
        console.error(`Batch ${i + 1} failed:`, error);
      }

      setProgress(((i + 1) / batches) * 100);

      // Delay between batches
      if (i < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setSending(false);
    
    if (success > 0) {
      toast.success(`Successfully sent ${success} emails`);
    }
    if (fail > 0) {
      toast.error(`Failed to send ${fail} emails`,{ duration: 5000});
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Bulk Email Sender</h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Valid Emails</p>
              <p className="text-3xl font-bold text-blue-900">{filteredEmployees.length}</p>
              {filterType === 'id10plus' && (
                <p className="text-xs text-blue-500 mt-1">ID Length ≥ 10 digits</p>
              )}
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-medium">Batch Size</p>
              <p className="text-3xl font-bold text-green-900">200</p>
              <p className="text-xs text-green-500 mt-1">Emails per batch</p>
            </div>
          </div>

          {/* Invalid Email Warning */}
          {invalidEmailCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold">{invalidEmailCount} employee(s) skipped due to invalid/missing email addresses</p>
              </div>
            </div>
          )}

          {/* Progress */}
          {sending && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  Processing Batch {currentBatch} of {totalBatches}
                </span>
                <span className="font-bold text-blue-600">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Success: {successCount}
                </span>
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Failed: {failCount}
                </span>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Emails sent in batches of 200</li>
                <li>Process may take several minutes for large lists</li>
                <li>Do not close this window during sending</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleBulkSend}
              disabled={sending || filteredEmployees.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send {filteredEmployees.length} Emails
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={sending}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Please Wait...' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEmailSender;
