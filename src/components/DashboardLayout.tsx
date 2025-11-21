import { useState } from "react";
import { 
  Home, 
  Calendar, 
  FileText, 
  Users, 
  Settings, 
  Menu, 
  X,
  Activity,
  Stethoscope,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  role: "patient" | "doctor" | "hospital";
  children: React.ReactNode;
}

const navItems = {
  patient: [
    { icon: Home, label: "Dashboard", href: "#" },
    { icon: Calendar, label: "Appointments", href: "#" },
    { icon: FileText, label: "Medical Records", href: "#" },
    { icon: Users, label: "My Doctors", href: "#" },
    { icon: Settings, label: "Settings", href: "#" },
  ],
  doctor: [
    { icon: Home, label: "Dashboard", href: "#" },
    { icon: Calendar, label: "Schedule", href: "#" },
    { icon: Users, label: "Patients", href: "#" },
    { icon: FileText, label: "Prescriptions", href: "#" },
    { icon: Settings, label: "Settings", href: "#" },
  ],
  hospital: [
    { icon: Home, label: "Dashboard", href: "#" },
    { icon: Users, label: "Staff Management", href: "#" },
    { icon: Building2, label: "Facilities", href: "#" },
    { icon: FileText, label: "Reports", href: "#" },
    { icon: Settings, label: "Settings", href: "#" },
  ],
};

const roleIcons = {
  patient: Activity,
  doctor: Stethoscope,
  hospital: Building2,
};

const DashboardLayout = ({ role, children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const RoleIcon = roleIcons[role];
  const items = navItems[role];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <RoleIcon className="w-5 h-5 text-primary-foreground" />
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
          "fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
          <div className="p-2 bg-primary rounded-lg">
            <RoleIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">MedConnect</span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Role badge */}
        <div className="absolute bottom-4 left-4 right-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
          <p className="font-semibold text-foreground capitalize">{role}</p>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
