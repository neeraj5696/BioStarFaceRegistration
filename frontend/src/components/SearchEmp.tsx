import { useState, useEffect } from "react";
import { Search, User, Mail, Send, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

 const rawBackendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
 const BioStarUrl = rawBackendUrl
   ? /^(https?:\/\/)/i.test(rawBackendUrl)
     ? rawBackendUrl
     : `http://${rawBackendUrl}`
   : "";

interface Employee {
  id: string;
  name: string;
  email: string;
}

const SearchEmp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [showSelected, setShowSelected] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BioStarUrl}/api/employees`, {});

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Sucessfully fetched employee datda from api");

      if (data.users && data.users.rows && Array.isArray(data.users.rows)) {
        const mappedEmployees = data.users.rows.map((emp: any) => ({
          id: emp.user_id,
          name: emp.name,
          email: emp.email || "",
        }));
        setAllEmployees(mappedEmployees);
        setFilteredEmployees(mappedEmployees);
      } else {
        setAllEmployees([]);
        setFilteredEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setAllEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredEmployees(allEmployees);
    } else {
      const filtered = allEmployees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, allEmployees]);

  const handleEmployeeToggle = (employee: Employee) => {
    setSelectedEmployees((prev) => {
      const isSelected = prev.some((emp) => emp.id === employee.id);
      if (isSelected) {
        return prev.filter((emp) => emp.id !== employee.id);
      } else {
        return [...prev, employee];
      }
    });
  };

  const handleSendEmail = async () => {
    if (selectedEmployees.length === 0) return;

    setSendingEmails(true);
    try {
      const promises = selectedEmployees.map((employee) =>
        axios.post(`${BioStarUrl}/api/send-email`, {
          employeeId: employee.id,
          email: employee.email,
        })
      );
      await Promise.all(promises);
      toast.success(
        `Verification emails sent to ${selectedEmployees.length} employee(s)`
      );
      setSelectedEmployees([]);
    } catch (error) {
      console.error("Error sending emails:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to send verification emails: ${errorMessage}`);
    } finally {
      setSendingEmails(false);
    }
  };

  const removeEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-2 sm:p-4 lg:p-6 xl:p-8">
      <div className="max-w-[2000px] mx-auto bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-4 sm:px-4 sm:py-5 md:px-6 lg:px-8 xl:px-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white">
                Employee Face Registration
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm md:text-base lg:text-lg mt-1">
                Select employees to send verification emails
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 rounded-2xl shadow-lg">
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">{allEmployees.length}</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-blue-100 uppercase tracking-wide">Total Employees</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] sm:h-[calc(100vh-180px)] md:h-[600px] lg:h-[650px] xl:h-[750px] 2xl:h-[850px] relative">
          {/* Left Panel - Employee List */}
          <div className={`w-full lg:w-1/2 xl:w-3/5 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col ${
            showSelected ? 'hidden lg:flex' : 'flex'
          }`}>
            {/* Search Header */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-11 md:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 lg:py-3.5 bg-white border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs sm:text-sm md:text-base shadow-sm"
                />
              </div>
            </div>

            {/* Employee List */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {loading && (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600">Loading employees...</span>
                </div>
              )}
              {!loading && filteredEmployees.length === 0 && searchTerm && (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <Search className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
                  <p className="text-xs sm:text-sm">No employees found</p>
                </div>
              )}
              {!loading &&
                filteredEmployees.map((employee) => {
                  const isSelected = selectedEmployees.some(
                    (emp) => emp.id === employee.id
                  );
                  return (
                    <div
                      key={employee.id}
                      onClick={() => handleEmployeeToggle(employee)}
                      className={`bg-gradient-to-r from-emerald-50 to-blue-50 mx-2 sm:mx-3 md:mx-4 my-1.5 sm:my-2 p-2.5 sm:p-3 md:p-4 lg:p-5 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 shadow-md"
                          : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleEmployeeToggle(employee)}
                          className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-white text-xs sm:text-sm md:text-base lg:text-lg font-bold flex-shrink-0 ${
                            isSelected
                              ? "bg-blue-600"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}
                        >
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate text-xs sm:text-sm md:text-base lg:text-lg">
                            {employee.name}
                          </p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 font-medium">
                            ID: {employee.id}
                          </p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 truncate flex items-center gap-1 mt-0.5 sm:mt-1">
                            <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Panel - Selected Employees */}
          <div className={`w-full lg:w-1/2 xl:w-2/5 flex flex-col bg-gradient-to-b from-slate-50 to-white ${
            showSelected ? 'flex' : 'hidden lg:flex'
          }`}>
            {/* Selected Header */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg lg:text-xl">
                  Selected for Registration
                </h3>
                <button
                  onClick={() => setShowSelected(false)}
                  className="lg:hidden p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="bg-emerald-100 text-emerald-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-medium">
                  {selectedEmployees.length} Selected
                </div>
                {selectedEmployees.length > 0 && (
                  <div className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-medium">
                    Ready to Send
                  </div>
                )}
              </div>
            </div>

            {/* Selected List */}
            <div className="flex-1 overflow-y-auto">
              {selectedEmployees.length === 0 ? (
                <div className="flex items-center justify-center h-full p-4">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-4 sm:p-6 md:p-8 mx-auto mb-3 sm:mb-4 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex items-center justify-center">
                      <User className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium text-sm sm:text-base md:text-lg">
                      No employees selected
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm md:text-base mt-1">
                      Choose employees from the left panel
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
                  {selectedEmployees.map((employee, index) => (
                    <div key={employee.id} className="group relative">
                      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
                            <div className="relative flex-shrink-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm md:text-base lg:text-lg font-bold shadow-md">
                                {employee.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs md:text-sm font-bold">
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate text-xs sm:text-sm md:text-base lg:text-lg">
                                {employee.name}
                              </p>
                              <p className="text-[10px] sm:text-xs md:text-sm text-blue-600 font-medium">
                                ID: {employee.id}
                              </p>
                              <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 truncate flex items-center gap-1 mt-0.5 sm:mt-1">
                                <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
                                {employee.email}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeEmployee(employee.id)}
                            className="opacity-100 lg:opacity-0 group-hover:opacity-100 p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 flex-shrink-0"
                            title="Remove employee"
                          >
                            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Send Button */}
            {selectedEmployees.length > 0 && (
              <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmails}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-2.5 sm:py-3 md:py-4 lg:py-5 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm md:text-base lg:text-lg"
                >
                  {sendingEmails ? (
                    <>
                      <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Sending Emails...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                      <span>
                        Send Registration Emails ({selectedEmployees.length})
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Floating Action Button - Mobile Only */}
          {selectedEmployees.length > 0 && !showSelected && (
            <button
              onClick={() => setShowSelected(true)}
              className="lg:hidden fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200 z-50 flex items-center gap-2"
            >
              <User className="h-5 w-5" />
              <span className="font-semibold text-sm">{selectedEmployees.length}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchEmp;
