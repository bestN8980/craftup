
import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Đang xác minh phiên đăng nhập
  if (loading) {
    return <div>Đang xác minh phiên đăng nhập...</div>;
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Không có quyền truy cập
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
