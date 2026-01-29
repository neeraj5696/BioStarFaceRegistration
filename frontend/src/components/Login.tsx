import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "./Login.css";
import {Eye, EyeOff } from "lucide-react";

// const rawBackendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
// const Backend_URL = rawBackendUrl
//   ? /^(https?:\/\/)/i.test(rawBackendUrl)
//     ? rawBackendUrl
//     : `http://${rawBackendUrl}`
//   : "";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();

  // Get CSRF token on component mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get(
          `/api/auth/csrf-token`,
          {
            withCredentials: true,
          }
        );
        setCsrfToken(response.data.csrfToken);
        console.log('kya hua',response.status)
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
      }
    };
    fetchCsrfToken();
  }, []);

  const handleSubmit = async () => {
    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }
   
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/auth/login`,
        {
          username,
          password,
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );
      console.log("login response", response.data);

      if (response.data.message === "Login successful") {
        // Store session data in localStorage
        localStorage.setItem(
          "sessionId",
          response.data.sessionId || Date.now().toString()
        );
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);

        navigate("/dashboard", {
          state: { responseData: response.data, username, password },
        });
      }
    } catch (error: any) {
      console.log("Error response:", error.response);
      const errorMessage = error.response?.data?.message || "Login failed";
      console.log(error.response?.message)
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-500 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="usage-section">
        <div className="login-title">
          <div className="flex justify-center mb-3">
            <img src="/krmu.jpg" style={{ height: "50px", width: "50px" }}
              alt="krmu" />
          </div>
          <h1 className="text-5xl font-bold p-2">Login</h1>
          <p className="text-sm text-gray-500 mt-2">Hover to continue</p>
        </div>

        <div className="login-body">
          <div className="login-left-image" >
            <img
              src="/krmu.jpg"
              alt="Login Illustration"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="login-form">
            <div className=" ">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  KRMU BIOMETRIC FACE REGISTRATION 
                </h2>
                <p className="text-gray-500 mt-2">
                  Enter your credentials to continue
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <div className="space-y-5">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
                      Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter your username"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        disabled={loading}
                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed hover:border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
                      Password
                    </label>
                    <div className="relative flex">
                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed hover:border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {isPasswordVisible ? <Eye /> : <EyeOff />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-8 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Logging in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white/70 text-sm">
        <div className="flex items-center justify-center gap-2 mb-1">
         
          <span>Magnum Telesystem Private Limited</span>
        </div>
        <p>© {new Date().getFullYear()} Magnum Inc. All rights reserved.</p>
      </div>

      {/* Bottom Right Logo */}
      <div className="absolute bottom-4 right-4">
        <img src="/magnum.png" 
          style={{height: '60px', width: '60px'}}
          alt="magnum" />
      </div>
    </div>
  );
}
export default Login;
