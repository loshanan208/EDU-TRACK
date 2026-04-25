import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../store/AuthContext";

function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  return <ProtectedRoute allowedRoles={["Admin"]}>{children}</ProtectedRoute>;
}

export function TeacherRoute({ children }) {
  return <ProtectedRoute allowedRoles={["Teacher"]}>{children}</ProtectedRoute>;
}

export function StudentRoute({ children }) {
  return <ProtectedRoute allowedRoles={["Student"]}>{children}</ProtectedRoute>;
}

export default ProtectedRoute;
