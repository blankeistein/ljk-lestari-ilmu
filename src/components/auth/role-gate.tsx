import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth-context";

import { getDashboardPath } from "@/lib/utils";

interface RoleGateProps {
  children: ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function RoleGate({ children, allowedRoles, redirectTo = "/login" }: RoleGateProps) {
  const { profile, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to={getDashboardPath(profile.role)} replace />;
  }

  return <>{children}</>;
}

