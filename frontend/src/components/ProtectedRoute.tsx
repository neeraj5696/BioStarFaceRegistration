import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const sessionId = localStorage.getItem("sessionId");
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");

  if (!sessionId || !username || !password) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
