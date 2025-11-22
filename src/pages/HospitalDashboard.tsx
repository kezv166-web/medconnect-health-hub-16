import { useState, useEffect } from "react";
import { Activity, Building2, Users, Settings, LogOut, Menu, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import ResourceControlCenter from "@/components/hospital/ResourceControlCenter";
import DoctorRoster from "@/components/hospital/DoctorRoster";
import HospitalRegistration from "@/components/hospital/HospitalRegistration";
import { supabase } from "@/integrations/supabase/client";

type TabType = "profile" | "resources" | "roster" | "settings";

const HospitalDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hospitalName, setHospitalName] = useState("Hospital");
  const navigate = useNavigate();

  useEffect(() => {
    fetchHospitalName();

    // Subscribe to realtime changes for hospital name
    const setupRealtimeSubscription = async () => {
      // Get user ID (mock or real)
      const mockRole = localStorage.getItem("mockRole");
      let userId: string | null = null;
      
      if (mockRole === "hospital") {
        userId = localStorage.getItem("mockHospitalUserId");
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id || null;
      }
      
      if (!userId) return;

      const channel = supabase
        .channel('hospital_name_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'hospital_profiles',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            if (payload.new && typeof payload.new === 'object' && 'name' in payload.new) {
              setHospitalName(payload.new.name as string);
            }
          }
        )
        .subscribe();

      return channel;
    };

    const channelPromise = setupRealtimeSubscription();

    return () => {
      channelPromise.then(channel => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      });
    };
  }, []);

  const fetchHospitalName = async () => {
    // Get user ID (mock or real)
    const mockRole = localStorage.getItem("mockRole");
    let userId: string | null = null;
    
    if (mockRole === "hospital") {
      userId = localStorage.getItem("mockHospitalUserId");
      if (!userId) {
        userId = `hospital_${crypto.randomUUID()}`;
        localStorage.setItem("mockHospitalUserId", userId);
      }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    }
    
    if (!userId) return;

    const { data } = await supabase
      .from('hospital_profiles')
      .select('name')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setHospitalName(data.name);
    }
  };

  const navItems = [
    { id: "profile" as const, icon: FileText, label: "Hospital Profile" },
    { id: "resources" as const, icon: Building2, label: "Resource Control" },
    { id: "roster" as const, icon: Users, label: "Doctor Roster" },
    { id: "settings" as const, icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive rounded-lg">
            <Building2 className="w-5 h-5 text-destructive-foreground" />
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
          <div className="p-2 bg-destructive rounded-lg">
            <Building2 className="w-5 h-5 text-destructive-foreground" />
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
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                  isActive
                    ? "bg-destructive text-destructive-foreground shadow-md"
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
          <div className="px-4 py-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
            <p className="font-semibold text-foreground">{hospitalName}</p>
            <p className="text-xs text-muted-foreground">Hospital Authority</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => {
            localStorage.removeItem("mockRole");
            localStorage.removeItem("mockHospitalUserId");
            navigate("/");
          }}
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

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6">
          {activeTab === "profile" && (
            <div className="animate-fade-in">
              <HospitalRegistration />
            </div>
          )}

          {activeTab === "resources" && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Resource Control Center
                </h1>
                <p className="text-muted-foreground">
                  Manage hospital resources and update availability in real-time
                </p>
              </div>
              <ResourceControlCenter />
            </div>
          )}

          {activeTab === "roster" && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Doctor Roster
                </h1>
                <p className="text-muted-foreground">
                  Manage your hospital's medical staff and their specializations
                </p>
              </div>
              <DoctorRoster />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold text-foreground mb-4">Settings</h1>
              <p className="text-muted-foreground">Settings coming soon...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HospitalDashboard;
