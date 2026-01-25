import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  MapPin,
  DollarSign,
  Tag,
  BarChart3,
  Settings,
  LogOut,
  Volleyball,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { useToast } from "@/hooks/use-toast";

const AdminSidebar = ({
  onCollapsedChange,
}: {
  onCollapsedChange?: (collapsed: boolean) => void;
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  const handleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });

    Cookies.remove("admin_token", { path: "/" });
    Cookies.remove("admin_info", { path: "/" });

    setTimeout(() => {
      window.location.href = "/admin/login";
    }, 500);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Calendar, label: "Calendar", href: "/admin/calendar" },
    { icon: ClipboardList, label: "Bookings", href: "/admin/bookings" },
    { icon: MapPin, label: "Courts", href: "/admin/courts" },
    { icon: DollarSign, label: "Pricing", href: "/admin/pricing" },
    { icon: Tag, label: "Promo Codes", href: "/admin/promos" },
    { icon: Home, label: "Back to Home", href: "/" },
    // { icon: BarChart3, label: "Reports", href: "/admin/reports" },
    // { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={cn(
        "hidden lg:flex min-h-screen bg-sidebar text-sidebar-foreground flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center flex-shrink-0">
          <img
            src="/logo.png"
            alt="Jeddah Cricket Nets Logo"
            className="h-10 w-10 object-contain"
          />{" "}
        </div>
        {!collapsed && (
          <span className="font-bold text-lg text-sidebar-foreground">
            Jeddah Cricket Nets
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              isActive(item.href)
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={handleCollapse}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
          {!collapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
