import SearchEmp from "../components/SearchEmp";
import { Shield } from "lucide-react";

const HRpage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm ">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">BioStar HR Dashboard</h1>
              <p className="text-sm text-gray-600">Face Registration Management</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <SearchEmp />
      </div>
    </div>
  );
};

export default HRpage;
