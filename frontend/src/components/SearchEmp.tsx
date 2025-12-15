import { useState, useEffect } from 'react';
import { Search, User, Mail, Send } from 'lucide-react';
import axios from 'axios';

interface Employee {
  id: string;
  name: string;
  email: string;
}

const SearchEmp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async (search: string = '') => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/employees?search=${encodeURIComponent(search)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEmployees(searchTerm);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleEmployeeToggle = (employee: Employee) => {
    setSelectedEmployees(prev => {
      const isSelected = prev.some(emp => emp.id === employee.id);
      if (isSelected) {
        return prev.filter(emp => emp.id !== employee.id);
      } else {
        return [...prev, employee];
      }
    });
  };

  const handleSendEmail = async () => {
    if (selectedEmployees.length > 0) {
      try {
        const promises = selectedEmployees.map(employee => 
          axios.post('http://localhost:5000/api/send-email', {
            employeeId: employee.id,
            email: employee.email
          })
        );
        await Promise.all(promises);
        alert(`Verification emails sent to ${selectedEmployees.length} employee(s)`);
      } catch (error) {
        console.error('Error sending emails:', error);
        alert('Failed to send verification emails');
      }
    }
  };

  return (
    <div className="w-1/2 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Search Employees</h2>
      
      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Employee List */}
      <div className="max-h-96 overflow-y-auto mb-4">
        {loading && <p className="text-gray-500 text-center py-4">Loading...</p>}
        {!loading && employees.length === 0 && searchTerm && (
          <p className="text-gray-500 text-center py-4">No employees found</p>
        )}
        {!loading && employees.map((employee) => {
          const isSelected = selectedEmployees.some(emp => emp.id === employee.id);
          return (
            <div
              key={employee.id}
              onClick={() => handleEmployeeToggle(employee)}
              className={`p-3 border rounded-lg mb-2 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleEmployeeToggle(employee)}
                  className="h-4 w-4 text-blue-600"
                  onClick={(e) => e.stopPropagation()}
                />
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-800">{employee.name}</p>
                  <p className="text-xs text-gray-500">ID: {employee.id}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {employee.email}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Send Email Button */}
      {selectedEmployees.length > 0 && (
        <div className="border-t pt-4">
          <div className="bg-blue-50 p-3 rounded-lg mb-3">
            <p className="text-sm text-gray-700">Selected Employees ({selectedEmployees.length}):</p>
            <div className="max-h-32 overflow-y-auto">
              {selectedEmployees.map(employee => (
                <div key={employee.id} className="text-xs text-gray-600 mb-1">
                  {employee.name} - {employee.id}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleSendEmail}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send Face Registration Emails ({selectedEmployees.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchEmp;