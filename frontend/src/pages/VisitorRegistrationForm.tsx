import  { useState } from "react";
import { Shield, LogOut, } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VisitorRegistrationForm = () => {
    const [visitor, setVisitor] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        department: "",
        title: "",
        userGroup: ""
    });
    const navigate = useNavigate();
    // const [loading, setLoading] = useState(false);
  //  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // const validateForm = () => {
    //     const newErrors: Record<string, string> = {};

    //     if (!visitor.fullName.trim()) newErrors.fullName = "Full name is required";
    //     if (!visitor.email.trim()) newErrors.email = "Email is required";
    //     else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitor.email)) newErrors.email = "Invalid email format";
    //     if (!visitor.phone.trim()) newErrors.phone = "Phone number is required";
    //     if (!visitor.address.trim()) newErrors.address = "Address is required";
    //     if (!visitor.department.trim()) newErrors.department = "Department is required";
    //     if (!visitor.title.trim()) newErrors.title = "Title is required";
    //     if (!visitor.userGroup) newErrors.userGroup = "Please select a user group";

    //     setErrors(newErrors);
    //     return Object.keys(newErrors).length === 0;
    // };

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();

    //     if (!validateForm()) return;

    //     setLoading(true);
    //     setSubmitMessage(null);

    //     try {
    //         const response = await fetch("http://localhost:5000/api/addVisitor", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //             body: JSON.stringify(visitor)
    //         });

    //         if (!response.ok) {
    //             throw new Error("Failed to submit visitor");
    //         }

    //         const data = await response.json();
    //         console.log("Visitor registered:", data);

    //         setSubmitMessage({
    //             type: "success",
    //             text: "✓ Visitor registered successfully!"
    //         });

    //         // Reset form
    //         setVisitor({
    //             fullName: "",
    //             email: "",
    //             phone: "",
    //             address: "",
    //             department: "",
    //             title: "",
    //             userGroup: ""
    //         });

    //         setTimeout(() => setSubmitMessage(null), 5000);

    //     } catch (error) {
    //         console.error("Error submitting form:", error);
    //         setSubmitMessage({
    //             type: "error",
    //             text: "✗ Failed to register visitor. Please try again."
    //         });
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleInputChange = (field: string, value: string) => {
        setVisitor({ ...visitor, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50  ">
            {/* Header Section */}
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
                                Visitor Registration Management
                            </p>
                        </div>

                        {/* Search Header */}
                        <div className="flex-1 max-w-2xl mx-4">

                        </div>

                        {/* Action Icons */}
                        <div className="flex items-center gap-2 justify-between">


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


                                {/* Popup */}

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="max-w-4xl mx-auto mt-10">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 sm:px-8 py-6">
                        <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Registration Details
                        </h2>
                    </div>

                    {/* Form Content */}
                    <form  className="p-6 sm:p-8">
                        {/* Grid Layout */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            {/* Full Name */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={visitor.fullName}
                                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fullName
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-300 bg-white hover:border-gray-400"
                                        }`}
                                />
                                {errors.fullName && (
                                    <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={visitor.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-300 bg-white hover:border-gray-400"
                                        }`}
                                />
                                {errors.email && (
                                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="+91 0123456789"
                                    value={visitor.phone}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-300 bg-white hover:border-gray-400"
                                        }`}
                                />
                                {errors.phone && (
                                    <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                                )}
                            </div>

                            {/* Department */}
                            <div>
                                <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="department"
                                    type="text"
                                    placeholder="e.g., Human Resources"
                                    value={visitor.department}
                                    onChange={(e) => handleInputChange("department", e.target.value)}
                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.department
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-300 bg-white hover:border-gray-400"
                                        }`}
                                />
                                {errors.department && (
                                    <p className="text-red-600 text-sm mt-1">{errors.department}</p>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Job Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    placeholder="e.g., Manager"
                                    value={visitor.title}
                                    onChange={(e) => handleInputChange("title", e.target.value)}
                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-300 bg-white hover:border-gray-400"
                                        }`}
                                />
                                {errors.title && (
                                    <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                                )}
                            </div>

                            {/* User Group */}
                            <div>
                                <label htmlFor="userGroup" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Visitor Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="userGroup"
                                    value={visitor.userGroup}
                                    onChange={(e) => handleInputChange("userGroup", e.target.value)}
                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.userGroup
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-300 hover:border-gray-400"
                                        }`}
                                >
                                    <option value="">Select a visitor type</option>
                                    <option value="visitor">Visitor</option>
                                    <option value="contractor">Contractor</option>
                                    <option value="employee">Employee</option>
                                </select>
                                {errors.userGroup && (
                                    <p className="text-red-600 text-sm mt-1">{errors.userGroup}</p>
                                )}
                            </div>
                        </div>

                        {/* Address - Full Width */}
                        <div className="mb-8">
                            <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                                Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="address"
                                rows={4}
                                placeholder="Enter your complete address"
                                value={visitor.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.address
                                    ? "border-red-300 bg-red-50"
                                    : "border-gray-300 bg-white hover:border-gray-400"
                                    }`}
                            />
                            {errors.address && (
                                <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-end">
                            <button
                                type="reset"
                                onClick={() => {
                                    setVisitor({
                                        fullName: "",
                                        email: "",
                                        phone: "",
                                        address: "",
                                        department: "",
                                        title: "",
                                        userGroup: ""
                                    });
                                    setErrors({});
                                }}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                Clear Form
                            </button>
                            {/* <button
                                type="submit"
                                disabled={loading}
                                className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${loading
                                    ? "opacity-70 cursor-not-allowed"
                                    : "hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5"
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Submit Registration
                                    </>
                                )}
                            </button> */}
                        </div>
                    </form>
                </div>
            </div>

            {/* Footer Info */}
            <div className="max-w-4xl mx-auto mt-8 text-center text-gray-600 text-sm">
                <p>✓ All fields are required. Your information will be securely stored.</p>
            </div>
        </div>
    );
};

export default VisitorRegistrationForm;
