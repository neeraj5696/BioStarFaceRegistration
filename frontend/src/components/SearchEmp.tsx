import { useState, useEffect } from "react";
import { Search, User, Mail, Send, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const BioStarUrl = import.meta.env.VITE_BIOSTAR_URL;

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
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white">
              Employee Face Registration
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Select employees to send verification emails
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-full shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{allEmployees.length}</div>
              <div className="text-xs text-blue-100 uppercase tracking-wide">Total Employees</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[650px]">
        {/* Left Panel - Employee List */}
        <div className="w-1/2 border-r border-gray-200">
          {/* Search Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <div className=" relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm shadow-sm"
              />
            </div>
          </div>

          {/* Employee List */}
          <div className="overflow-y-auto h-full bg-gray-50">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="ml-3 text-gray-600">Loading employees...</span>
              </div>
            )}
            {!loading && filteredEmployees.length === 0 && searchTerm && (
              <div className="text-center py-12 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No employees found</p>
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
                    className={`bg-gradient-to-r from-emerald-50 to-blue-50 mx-3 my-2 p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 shadow-md"
                        : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleEmployeeToggle(employee)}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          isSelected
                            ? "bg-blue-600"
                            : "bg-gradient-to-br from-gray-400 to-gray-500"
                        }`}
                      >
                        {employee.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {employee.name}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          ID: {employee.id}
                        </p>
                        <p className="text-xs text-gray-600 truncate flex items-center gap-1 mt-1">
                          <Mail className="h-3 w-3" />
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
        <div className="w-1/2 flex flex-col bg-gradient-to-b from-slate-50 to-white">
          {/* Selected Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Selected for Registration
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium">
                {selectedEmployees.length} Selected
              </div>
              {selectedEmployees.length > 0 && (
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  Ready to Send
                </div>
              )}
            </div>
          </div>

          {/* Selected List */}
          <div className="flex-1 overflow-y-auto">
            {selectedEmployees.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 mx-auto mb-4 w-24 h-24 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    No employees selected
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Choose employees from the left panel
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {selectedEmployees.map((employee, index) => (
                  <div key={employee.id} className="group relative">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                              {employee.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {employee.name}
                            </p>
                            <p className="text-xs text-blue-600 font-medium">
                              ID: {employee.id}
                            </p>
                            <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-1">
                              <Mail className="h-3 w-3" />
                              {employee.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeEmployee(employee.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                          title="Remove employee"
                        >
                          <X className="h-4 w-4" />
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
            <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
              <button
                onClick={handleSendEmail}
                disabled={sendingEmails}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3"
              >
                {sendingEmails ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Sending Emails...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>
                      Send Registration Emails ({selectedEmployees.length})
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchEmp;
