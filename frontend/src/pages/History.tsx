import { useEffect, useState } from "react";
//import { useNavigate } from "react-router-dom";
import {
  Mail,
  CheckCircle,
  Clock,
  // ArrowLeft,
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

// const rawBackendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
// const BioStarUrl = rawBackendUrl
//   ? /^(https?:\/\/)/i.test(rawBackendUrl)
//     ? rawBackendUrl
//     : `http://${rawBackendUrl}`
//   : "";

const History = () => {
  //  const navigate = useNavigate();
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 100;

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/history?limit=${limit}&offset=${page * limit}`
      );
      setData(response.data);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };
  const HandleExcelExport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/history?limit=20000&offset=0`);
      const allData = response.data.history;

      const excelData = allData.map((item: HistoryItem, index: number) => ({
        "S.No": index + 1,
        Name: item.name,
        Email: item.email,
        "Mail Sent": formatDateTime(item.mailSentAt),
        Status: item.status === "success" ? "Success" : "Pending",
      }));
      //Converts a JavaScript array of objects into an Excel worksheet. object keys are used as column headers. object are used as rows.
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      //Creates a new empty Excel workbook.
      const workbook = XLSX.utils.book_new();

      //Appends the worksheet to the workbook with the specified sheet name.
      XLSX.utils.book_append_sheet(workbook, worksheet, "Enrollment History");

      const fileName = `Enrollment_History_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      //Generates and downloads the Excel file.
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export data to Excel");
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center ">
            <div className="flex items-center gap-3">
              {/* <button
                onClick={() => navigate("/dashboard")}
                className="rounded-lg bg-white/10 p-2 text-white shadow-sm transition hover:bg-white/20 hover:shadow-md active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" />
              </button> */}

              <h1 className="text-xl font-semibold tracking-tight text-white">
                Enrollment History
              </h1>
            </div>

            {/* Excel Export Button  */}
            <button
              onClick={HandleExcelExport}
              className="ml-auto flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 shadow-sm transition hover:bg-green-100 hover:shadow-md active:scale-[0.98]"
            >
              <FileSpreadsheet className="h-5 w-5" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.history.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No history data available
                    </td>
                  </tr>
                ) : (
                  data?.history.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
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
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.status === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {item.status === "success" ? "Success" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {total > limit && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page + 1} of {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * limit >= total}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
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
