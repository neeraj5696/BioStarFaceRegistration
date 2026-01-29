import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Mail,
  CheckCircle,
  Clock,
  Shield,
  LogOut,
  FileSpreadsheet,
} from "lucide-react";
import axios from "axios";
import * as XLSX from "xlsx";

interface HistoryItem {
  userId: string;
  name: string;
  email: string;
  mailSentAt: string;
  status: "pending" | "success";
}

interface HistoryData {
  stats: {
    totalMailsSent: number;
    successfullyEnrolled: number;
    pendingEnrollment: number;
  };
  history: HistoryItem[];
}

// const getBackendUrl = (): string => {
//   const rawUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
//   if (!rawUrl) return "";
//   return /^(https?:\/\/)/i.test(rawUrl) ? rawUrl : `http://${rawUrl}`;
// };

// const BACKEND_URL = getBackendUrl();
const ITEMS_PER_PAGE = 100;
const SEARCH_DEBOUNCE_MS = 300;
const LINK_EXPIRY_DAYS = 7;
const EXCEL_EXPORT_LIMIT = 20000;

const History = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState<HistoryData | null>(null);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState("1");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Focus search input after data loads
  useEffect(() => {
    if (!loading && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [loading]);

  useEffect(() => {
    fetchHistory();
  }, [page, debouncedSearch]);

  // Update filtered history when data changes
  useEffect(() => {
    if (!data?.history) {
      setFilteredHistory([]);
      return;
    }
    setFilteredHistory(data.history);
  }, [data]);

  const fetchHistory = useCallback(async () => {
    try {
      setError(null);
      if (isInitialLoad) {
        setLoading(true);
      }
      
      const params = new URLSearchParams();
      params.append("limit", ITEMS_PER_PAGE.toString());
      params.append("offset", (page * ITEMS_PER_PAGE).toString());
      
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }
      
      const response = await axios.get(`/api/history?${params}`);
      setData(response.data);
      setFilteredHistory(response.data.history || []);
      setTotal(response.data.total || 0);
      
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch history";
      setError(errorMsg);
      console.error("Error fetching history:", err);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  }, [page, debouncedSearch, isInitialLoad]);
  const handleExcelExport = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.get(`/api/history?limit=${EXCEL_EXPORT_LIMIT}&offset=0`);
      const allData = response.data.history || [];

      const excelData = allData.map((item: HistoryItem, index: number) => ({
        "S.No": index + 1,
        Name: item.name,
        Email: item.email,
        "Mail Sent": formatDateTime(item.mailSentAt),
        Status: item.status === "success" ? "Success" : "Pending",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Enrollment History");

      const fileName = `Enrollment_History_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to export data";
      setError(errorMsg);
      console.error("Error exporting to Excel:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isLinkExpired = useCallback((mailSentAt: string): boolean => {
    const sentDate = new Date(mailSentAt);
    const currentDate = new Date();
    const diffInDays = (currentDate.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays > LINK_EXPIRY_DAYS;
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    const maxPage = Math.ceil(total / ITEMS_PER_PAGE);
    const validPage = Math.max(0, Math.min(newPage, maxPage - 1));
    setPage(validPage);
    setPageInput((validPage + 1).toString());
  }, [total]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">



      <div className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                BioStar HR Dashboard
              </h1>
              <p className="text-sm text-blue-100">
                Face Registration Management
              </p>
            </div>

            {/* Search Header */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-11 md:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 lg:py-3.5 bg-white border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-xs sm:text-sm md:text-base shadow-md"
                />
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/");
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="h-8 w-8 text-white" />
              </button>

              <button
                onClick={handleExcelExport}
                className="ml-auto flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 shadow-sm transition hover:bg-green-100 hover:shadow-md active:scale-[0.98]"
              >
                <FileSpreadsheet className="h-5 w-5" />
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Error: {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Mails Sent
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {data?.stats.totalMailsSent || 0}
                </p>
              </div>
              <Mail className="h-12 w-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Successfully Enrolled
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {data?.stats.successfullyEnrolled || 0}
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Pending Enrollment
                </p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {data?.stats.pendingEnrollment || 0}
                </p>
              </div>
              <Clock className="h-12 w-12 text-orange-500 opacity-20" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mail Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {searchTerm ? "No matching records found" : "No history data available"}
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr key={item.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDateTime(item.mailSentAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                            }`}
                        >
                          {item.status === "success" ? "Success" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isLinkExpired(item.mailSentAt)
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {isLinkExpired(item.mailSentAt) ? "Link Expired" : "Active"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {total > ITEMS_PER_PAGE && (
            <div className="px-6 py-4 border-t flex items-center justify-between gap-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page {page + 1} of {Math.ceil(total / ITEMS_PER_PAGE)}
                </span>
                <span className="text-gray-400">|</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={Math.ceil(total / ITEMS_PER_PAGE)}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        const pageNum = parseInt(pageInput) || 1;
                        handlePageChange(pageNum - 1);
                      }
                    }}
                    className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Go to"
                  />
                  <button
                    onClick={() => {
                      const pageNum = parseInt(pageInput) || 1;
                      handlePageChange(pageNum - 1);
                    }}
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    Go
                  </button>
                </div>
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={(page + 1) * ITEMS_PER_PAGE >= total}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
