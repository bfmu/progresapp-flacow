import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

type RoleRouteProps = {
  requiredRoles: string[];
  children?: React.ReactNode;
};

export default function RoleRoute({ requiredRoles, children }: RoleRouteProps) {
  const isAuth = useAuthStore((state) => state.isAuth);
  const profile = useAuthStore((state) => state.profile);

  if (!isAuth) {
    return <Navigate to="/app/login" />;
  }

  const hasRole = profile?.roles?.some((role) => requiredRoles.includes(role));
  if (!hasRole) {
    return <Navigate to="/app" />;
  }

  return children ? <>{children}</> : <Outlet />;
}


