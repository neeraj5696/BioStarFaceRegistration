import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  User,
  Users,
  Mail,
  Send,
  X,
  Shield,
  ChevronDown,
  LogOut,
  History as HistoryIcon,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import logger from "../utils/logger";
import BulkEmailSender from "./BulkEmailSender";

// const rawBackendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
// const BioStarUrl = rawBackendUrl
//   ? /^(https?:\/\/)/i.test(rawBackendUrl)
//     ? rawBackendUrl
//     : `http://${rawBackendUrl}`
//   : "";

interface UserGroup {
  id: string;
  name: string;
}
interface Employee {
  id: string;
  name: string;
  email: string;
  login_id: string;
  password: string;
  department: string;
  user_group_id: UserGroup;
}

// Utility to get user initials (first letters of up to 2 names)
function getInitials(name: string) {
  if (!name) return "";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const toTitleCase = (s: string) =>
  s.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );

const SearchEmp = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [totaluser, setTotaluser] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [showSelected, setShowSelected] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(500);
  const [showBulkSender, setShowBulkSender] = useState(false);
  const [bulkFilterType, setBulkFilterType] = useState<"all" | "id10plus">(
    "all"
  );
  const location = useLocation();
  const { username, password } = location.state || {
    username: localStorage.getItem("username"),
    password: localStorage.getItem("password")
  };
  const [department, setDepartment] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [usergrouplist, setUsergrouplist] = useState<string[]>([]);
  const [selectedUserGroup, setSelectedUserGroup] = useState<string>("");
  const [showValidOnly, setShowValidOnly] = useState(false);
  const [showEmployeePopup, setShowEmployeePopup] = useState(false);

  // Count employees with ID >= 10 digits
  const employeesWithLongId = useMemo(() => {
    return allEmployees.filter(
      (emp) => typeof emp.id === "string" && emp.id.length >= 10
    );
  }, [allEmployees]);

  //for dropdown department list

  useEffect(() => {
    const departmentlist = [
      ...new Set(
        allEmployees
          .map((list) => list.department)
          .filter((dep) => dep && dep !== "N/A")
      ),
    ];
    setDepartment(departmentlist);
  }, [allEmployees]);

  // for user group list,

  useEffect(() => {
    const userlist = [
      ...new Set(
        allEmployees
          .map((list) => list.user_group_id?.name)
          .filter((name) => name && name !== "N/A")
      ),
    ];

    setUsergrouplist(userlist);
  }, [allEmployees]);

  // for search filter user_group_id.name

  // Optimize: Only render first N employees to prevent browser lag
  const displayedEmployees = useMemo(() => {
    return filteredEmployees.slice(0, displayLimit);
  }, [filteredEmployees, displayLimit]);

  const hasMoreEmployees = filteredEmployees.length > displayLimit;

  const fetchEmployees = useCallback(async () => {
    let response = null;
    setLoading(true);
    try {
      response = await axios.post(`/api/employees`, {
        username,
        password,
      });

      const users = await response.data;

      //Setting the total user Count , fetch from api, not based on total user count fetched in frontend,
      const totalUser = await users.data?.total;
      setTotaluser(totalUser);

      // mapping the detaisl into state variable
      if (users.data && users.data.rows && Array.isArray(users.data.rows)) {
        const mappedEmployees = users.data.rows.map((emp: any) => ({
          id: emp.id,
          name: emp.name,
          email: emp.email || "",
          department: emp.department,
          user_group_id: emp.user_group_id,
        }));
        setAllEmployees(mappedEmployees);

        setFilteredEmployees(mappedEmployees);

        // Log user list fetched

        logger.logUserListFetched(mappedEmployees.length);
      } else {
        setAllEmployees([]);
        setFilteredEmployees([]);
      }
    } catch (error) {
      console.error("Error aa gaya:", error);
      console.log(response);
      setAllEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [username, password, setAllEmployees, setFilteredEmployees]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    try {
      let filtered = allEmployees;
      if (selectedDepartment) {
        filtered = allEmployees.filter(
          (emp) => emp?.department === selectedDepartment
        );
      } else if (selectedUserGroup) {
        if (selectedUserGroup === "all") {
          filtered = allEmployees;
        } else {
          filtered = allEmployees.filter(
            (emp) =>
              emp?.user_group_id &&
              emp.user_group_id?.name === selectedUserGroup
          );
        }
      } else if (searchTerm) {
        filtered = allEmployees.filter(
          (emp) =>
            emp?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp?.id?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (showValidOnly) {
        filtered = filtered.filter(
          (emp) => emp?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emp.email)
        );
      }
      setFilteredEmployees(filtered);
      setDisplayLimit(100);
    } catch (error) {
      console.error("Error filtering employees:", error);
      toast.error("Failed to filter employees. Please try again.");
      setFilteredEmployees([]);
    }
  }, [
    selectedDepartment,
    selectedUserGroup,
    searchTerm,
    allEmployees,
    showValidOnly,
  ]);

  const handleLoadMore = () => {
    setDisplayLimit((prev) => prev + 200);
  };

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

    // Validate emails
    const validEmployees = selectedEmployees.filter((emp) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emp.email && emailRegex.test(emp.email);
    });

    if (validEmployees.length === 0) {
      toast.error("No valid email addresses found in selected employees");
      return;
    }

    if (validEmployees.length < selectedEmployees.length) {
      toast.error(
        `${selectedEmployees.length - validEmployees.length
        } employee(s) skipped due to invalid email`
      );
    }

    setSendingEmails(true);
    try {
      const promises = validEmployees.map((employee) =>
        axios.post(`/api/send-email`, {
          employeeId: employee.id,
          email: employee.email,
          name: employee.name,
        })
      );
      await Promise.all(promises);

      // Log emails sent from frontend
      logger.logEmailsSent(
        validEmployees.length,
        validEmployees.map((emp) => ({
          id: emp.id,
          name: emp.name,
          email: emp.email,
        }))
      );

      toast.success(
        `Successfully sent verification emails to ${validEmployees.length} employee(s)`,
        {
          duration: 8000,
        }
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

  const handleEmployee = () => {
    setShowEmployeePopup(!showEmployeePopup);
  };

  useEffect(() => {
    if (showEmployeePopup) {
      const timer = setTimeout(() => {
        setShowEmployeePopup(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showEmployeePopup]);

  return (
    <>
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
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-11 md:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 lg:py-3.5 bg-white border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-xs sm:text-sm md:text-base shadow-sm"
                />
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-2 justify-between">
              <button
                onClick={() => navigate("/history")}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
                title="View History"
              >
                <HistoryIcon className="h-8 w-8 text-white" />
              </button>

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

              {/* Total Employee Count */}
              <div className="relative">
                <div
                  className="p-2 hover:bg-white/20 rounded-lg transition-all cursor-pointer"
                  title="Click to see Employee"
                >
                  <button onClick={handleEmployee}>
                    <Users className="h-8 w-8 ml-30 text-white" />
                  </button>
                </div>

                {/* Popup */}
                {showEmployeePopup && (
                  <div className="absolute top-12 right-0 bg-white text-gray-800 px-4 py-3 rounded-xl shadow-xl min-w-[160px] animate-fadeIn z-50">
                    <p className="text-sm text-gray-500">Total Employees</p>
                    <p className="text-2xl font-bold text-blue-600">{totaluser}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* // employee field */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-2 sm:p-4 lg:p-6 xl:p-8">
          <div className="max-w-[2000px] mx-auto bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex flex-col lg:flex-row  h-[90vh] relative">
              {/* Left Panel - Employee List */}
              <div
                className={`w-full lg:w-1/2 xl:w-4/6 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col overflow-auto ${showSelected ? "hidden lg:flex" : "flex"
                  }`}
              >
                {/* Employee List */}
                <div className="flex-1 overflow-y-auto bg-gray-50 overflow-auto ">
                  {loading && (
                    <div className="flex items-center justify-center py-8 sm:py-12">
                      <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600">
                        Loading employees...
                      </span>
                    </div>
                  )}
                  {!loading && filteredEmployees.length === 0 && searchTerm && (
                    <div className="text-center py-8 sm:py-12 text-gray-500">
                      <Search className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
                      <p className="text-xs sm:text-sm">No employees found</p>
                    </div>
                  )}

                  {!loading && filteredEmployees.length > 0 && (
                    <div className="sticky top-0 z-30 px-3 sm:px-4 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 border-b border-blue-400 shadow-lg">
                      <div className="flex flex-col sm:flex-row items-center sm:gap-3 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-md border border-gray-200">
                        {
                          <button
                            onClick={() => {
                              if (
                                selectedEmployees.length ===
                                filteredEmployees.length
                              ) {
                                setSelectedEmployees([]);
                              } else {
                                setSelectedEmployees(filteredEmployees);
                              }
                            }}
                            className="min-w-[120px] px-4 py-2.5 font-semibold rounded-lg border-2 border-blue-500 focus:ring-2 focus:ring-blue-400 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm shadow-md transition-all duration-200 outline-none cursor-pointer hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
                          >
                            {selectedEmployees.length ===
                              filteredEmployees.length
                              ? "Deselect All"
                              : "Select All"}
                          </button>
                        }

                        <select
                          value={selectedDepartment}
                          onChange={(e) =>
                            setSelectedDepartment(e.target.value)
                          }
                          className="min-w-[157px] max-w-[157px] px-3 font-medium py-2.5 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-400 bg-white text-gray-800 text-sm shadow-sm transition-all duration-200 outline-none cursor-pointer hover:border-blue-500 hover:bg-blue-50 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          <option value="" className="text-gray-500">
                            {selectedDepartment
                              ? "Clear Department"
                              : "Select Department"}
                          </option>
                          {department.map((item, index) => (
                            <option key={index} value={item} className="text-gray-900 font-medium">
                              {toTitleCase(item)}
                            </option>
                          ))}
                        </select>
                        <select
                          value={selectedUserGroup}
                          onChange={(e) => setSelectedUserGroup(e.target.value)}
                          className="min-w-[155px] px-3 py-2.5 rounded-lg font-medium border-2 border-gray-300 focus:ring-2 focus:ring-blue-400 bg-white text-gray-800 text-sm shadow-sm transition-all duration-200 outline-none cursor-pointer hover:border-blue-500 hover:bg-blue-50 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          <option value="" className="text-gray-500">
                            {selectedUserGroup
                              ? "Clear User Group"
                              : "Select User Group"}
                          </option>
                          <option value="all" className="text-gray-900 font-medium">All Users</option>
                          {usergrouplist.map((item, index) => (
                            <option key={index} value={item} className="text-gray-900 font-medium">
                              {toTitleCase(item)}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => {
                            setBulkFilterType("id10plus");
                            setShowBulkSender(true);
                          }}
                          className="flex items-center justify-center min-w-[120px] px-3 py-2.5 rounded-lg font-medium border-2 border-purple-400 focus:ring-2 focus:ring-purple-400 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm shadow-md transition-all duration-200 outline-none cursor-pointer hover:from-purple-600 hover:to-purple-700 hover:shadow-lg active:scale-95 disabled:from-gray-300 disabled:to-gray-400"
                        >
                          Student ({employeesWithLongId.length})
                        </button>
                        <button
                          onClick={() => setShowValidOnly(!showValidOnly)}
                          className={`flex items-center justify-center gap-2 px-4 py-2.5 font-medium rounded-lg shadow-md transition-all duration-200 text-sm active:scale-95 ${showValidOnly
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-2 border-green-400 hover:from-green-600 hover:to-green-700"
                            : "bg-white text-gray-800 border-2 border-gray-300 hover:border-green-500 hover:bg-green-50"
                            }`}
                        >
                          <Mail className="h-5 w-5" />
                          Valid
                        </button>
                      </div>
                    </div>
                  )}
                  {!loading &&
                    displayedEmployees.map((employee) => {
                      const isSelected = selectedEmployees.some(
                        (emp) => emp.id === employee.id
                      );
                      const hasValidEmail =
                        employee.email &&
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email);
                      return (
                        <div
                          key={employee.id}
                          onClick={() => handleEmployeeToggle(employee)}
                          className={`bg-gradient-to-r from-emerald-50 to-blue-50 mx-2 sm:mx-3 md:mx-4 my-1.5 sm:my-2 p-2.5 sm:p-3 md:p-4 lg:px-5 lg:py-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.01] focus:ring-2 focus:ring-blue-400 ${isSelected
                            ? "bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 shadow-md"
                            : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                            } ${!hasValidEmail ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-center py-4 gap-2 sm:gap-3 md:gap-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleEmployeeToggle(employee)}
                              className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Select ${employee.name}`}
                            />
                            <div
                              className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-white text-xs sm:text-sm md:text-base lg:text-lg font-bold flex-shrink-0 ${isSelected
                                ? "bg-blue-600"
                                : "bg-gradient-to-br from-gray-400 to-gray-500"
                                }`}
                            >
                              {getInitials(employee.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate text-xs sm:text-sm md:text-base lg:text-lg">
                                {toTitleCase(employee.name)}
                              </p>
                              <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                                <span className="text-[10px] sm:text-xs md:text-sm text-blue-600 font-medium flex items-center">
                                  <span className="mr-0.5">ID:</span>{" "}
                                  {employee.id}
                                </span>
                                <span
                                  className={`text-[10px] mb-1 sm:text-xs md:text-sm truncate flex items-center gap-1 ${hasValidEmail
                                    ? "text-gray-600"
                                    : "text-red-500"
                                    }`}
                                >
                                  <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
                                  {employee.email || "No email"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {!loading && hasMoreEmployees && (
                    <div className="p-4 flex justify-center">
                      <button
                        onClick={handleLoadMore}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                      >
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                        Load More ({filteredEmployees.length -
                          displayLimit}{" "}
                        remaining)
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Selected Employees */}
              <div
                className={`w-full lg:w-1/2 xl:w-2/6 flex flex-col bg-gradient-to-b from-slate-50 to-white ${showSelected ? "flex" : "hidden lg:flex"
                  }`}
              >
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

                {/* Send Button - Sticky */}
                {selectedEmployees.length > 0 && (
                  <div className="sticky bottom-0 p-3 sm:p-4 md:p-6 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 shadow-lg">
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
                            Send Registration Emails ({selectedEmployees.length}
                            )
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
                  <span className="font-semibold text-sm">
                    {selectedEmployees.length}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Email Sender Modal */}
      {showBulkSender && (
        <BulkEmailSender
          employees={filteredEmployees}
          onClose={() => setShowBulkSender(false)}
          filterType={bulkFilterType}
        />
      )}
    </>
  );
};

export default SearchEmp;
