import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const token = Cookies.get("admin_token");
  const location = useLocation();

  if (token) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
