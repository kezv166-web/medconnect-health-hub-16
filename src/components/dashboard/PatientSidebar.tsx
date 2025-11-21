import { useState } from "react";
import { Home, User, Pill, MapPin, FileText, Menu, X, Activity, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type SidebarItem = "home" | "profile" | "medicines" | "nearby" | "form";

interface PatientSidebarProps {
  activeTab: SidebarItem;
  onTabChange: (tab: SidebarItem) => void;
}

const navItems = [
  { id: "home" as const, icon: Home, label: "Home" },
  { id: "profile" as const, icon: User, label: "My Profile" },
  { id: "medicines" as const, icon: Pill, label: "Medicines" },
  { id: "nearby" as const, icon: MapPin, label: "Nearby Services" },
  { id: "form" as const, icon: FileText, label: "Update Form" },
];

const PatientSidebar = ({ activeTab, onTabChange }: PatientSidebarProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <>
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">MedConnect</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 transition-transform duration-300 flex flex-col",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border flex-shrink-0">
          <div className="p-2 bg-primary rounded-lg">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">MedConnect</span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border space-y-2 flex-shrink-0">
          <div className="px-4 py-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
            <p className="font-semibold text-foreground">John Doe</p>
            <p className="text-xs text-muted-foreground">Patient</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default PatientSidebar;
