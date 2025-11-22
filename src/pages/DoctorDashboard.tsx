import { useState, useEffect } from "react";
import { Stethoscope, Building2, Users, Settings, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import ClinicRegistration from "@/components/doctor/ClinicRegistration";
import PatientConnect from "@/components/doctor/PatientConnect";
import { supabase } from "@/integrations/supabase/client";
type TabType = "clinic" | "patients" | "settings";
const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("clinic");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [clinicName, setClinicName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndClinic = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
        
        // Fetch clinic profile
        const { data: hospitalProfile } = await supabase
          .from('hospital_profiles')
          .select('name')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (hospitalProfile?.name) {
          setClinicName(hospitalProfile.name);
        }
      }
    };
    fetchUserAndClinic();
  }, []);
  const navItems = [{
    id: "clinic" as const,
    icon: Building2,
    label: "Clinic Registration"
  }, {
    id: "patients" as const,
    icon: Users,
    label: "Patient Connect"
  }, {
    id: "settings" as const,
    icon: Settings,
    label: "Settings"
  }];
  return <div className="min-h-screen bg-background flex">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-success rounded-lg">
            <Stethoscope className="w-5 h-5 text-success-foreground" />
          </div>
          <span className="font-semibold text-foreground">MedConnect</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside className={cn("fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 transition-transform duration-300 flex flex-col", "lg:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border flex-shrink-0">
          <div className="p-2 bg-success rounded-lg">
            <Stethoscope className="w-5 h-5 text-success-foreground" />
          </div>
          <span className="font-semibold text-foreground">MedConnect</span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return <button key={item.id} onClick={() => {
            setActiveTab(item.id);
            setSidebarOpen(false);
          }} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200", isActive ? "bg-success text-success-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>;
        })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border space-y-2 flex-shrink-0">
          <div className="px-4 py-3 bg-success/10 rounded-lg border border-success/20">
            <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
            <p className="font-semibold text-foreground">{clinicName || userEmail || "Doctor"}</p>
            <p className="text-xs text-muted-foreground">Medical Doctor</p>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={() => navigate("/")}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 my-0">
          {activeTab === "clinic" && <div className="animate-fade-in">
              <div className="mb-8">
                
                
              </div>
              <ClinicRegistration />
            </div>}

          {activeTab === "patients" && <div className="animate-fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Patient Connect
                </h1>
                <p className="text-muted-foreground">
                  Manage your patients and send referral invitations
                </p>
              </div>
              <PatientConnect />
            </div>}

          {activeTab === "settings" && <div className="animate-fade-in">
              <h1 className="text-3xl font-bold text-foreground mb-4">Settings</h1>
              <p className="text-muted-foreground">Settings coming soon...</p>
            </div>}
        </div>
      </main>
    </div>;
};
export default DoctorDashboard;