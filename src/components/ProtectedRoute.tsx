import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
}) => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  console.log("ProtectedRoute Debug:", {
    isAuthenticated,
    user,
    requiredRoles,
    currentPath: location.pathname,
  });

  if (!isAuthenticated || !user) {
    console.log("Redirecting to login - not authenticated");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    console.log(
      `Access denied - User role: ${user.role}, Required: ${requiredRoles}`
    );

    const redirectPath = user.role === "CUSTOMER" ? "/tickets" : "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  console.log("Access granted");
  return <>{children}</>;
};

export default ProtectedRoute;
