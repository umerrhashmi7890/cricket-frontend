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
  X,
  Home,
} from "lucide-react";
import Cookies from "js-cookie";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AdminMobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminMobileNav = ({ isOpen, onClose }: AdminMobileNavProps) => {
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });

    Cookies.remove("admin_token", { path: "/" });
    Cookies.remove("admin_info", { path: "/" });
    onClose();

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
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-64 bg-sidebar text-sidebar-foreground flex flex-col z-50 transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <img
                src="/logo.png"
                alt="Jeddah Cricket Nets Logo"
                className="h-10 w-10 object-contain"
              />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground ">
              Jeddah Cricket Nets
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive(item.href)
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminMobileNav;
