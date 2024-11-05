import { Navigate, Outlet } from "react-router-dom";
interface Props {
  isAllowed: boolean;
  children?: React.ReactNode;
}

export default function ProtectedRoute({ isAllowed, children }: Props) {
  if (!isAllowed) {
    return <Navigate to="/app/login" />;
  }
  return children ? <>{children}</> : <Outlet />;
}
