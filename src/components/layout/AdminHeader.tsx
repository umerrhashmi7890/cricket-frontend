import { Menu } from "lucide-react";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  return (
    <header className="lg:hidden bg-card border-b sticky top-0 z-30">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Jeddah Cricket Nets Logo"
              className="h-10 w-10 object-contain"
            />
          </div>
          <span className="font-bold text-lg">Jeddah Cricket Nets</span>
        </div>
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
