import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import AdminSidebar from "./AdminSidebar";
import AdminMobileNav from "./AdminMobileNav";
import AdminHeader from "./AdminHeader";

const AdminLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get("admin_token");
      if (!token) {
        navigate("/admin/login", { replace: true });
      }
    };

    checkAuth();

    const interval = setInterval(checkAuth, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:z-10">
        <AdminSidebar onCollapsedChange={setSidebarCollapsed} />
      </div>

      <AdminMobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <AdminHeader onMenuClick={() => setMobileNavOpen(true)} />

        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
