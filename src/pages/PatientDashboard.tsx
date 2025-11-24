import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import PatientSidebar from "@/components/dashboard/PatientSidebar";
import StatusCards from "@/components/dashboard/StatusCards";
import HealthTips from "@/components/dashboard/HealthTips";
import MedicineManagement from "@/pages/MedicineManagement";
import ProfileSettings from "@/pages/ProfileSettings";
import UpdateProfileForm from "@/pages/UpdateProfileForm";
import NearbyServices from "@/pages/NearbyServices";
import FloatingChatButton from "@/components/ai/FloatingChatButton";
import MedicineTrackerCarousel from "@/components/medicine/MedicineTrackerCarousel";
import TodayScheduleView from "@/components/medicine/TodayScheduleView";
import NextDoseWidget from "@/components/medicine/NextDoseWidget";
import AdherenceAreaChart from "@/components/medicine/AdherenceAreaChart";
import { NotificationPermission } from "@/components/notifications/NotificationPermission";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { useMedicineNotifications } from "@/hooks/use-medicine-notifications";

type SidebarItem = "home" | "profile" | "nearby" | "form";

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState<SidebarItem>("home");
  const [patientName, setPatientName] = useState("Patient");
  const [fullName, setFullName] = useState("Patient");

  useMedicineNotifications();

  useEffect(() => {
    // Always ensure we start on home tab
    setActiveTab("home");
    
    const fetchPatientProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('patient_profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) {
          setFullName(data.full_name);
          setPatientName(data.full_name.split(' ')[0]);
        }
      }
    };
    fetchPatientProfile();
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <PatientSidebar activeTab={activeTab} onTabChange={setActiveTab} userName={fullName} />
      
      {/* Floating AI Chat Button */}
      <FloatingChatButton />
      
      <main className="flex-1 lg:ml-64 overflow-x-hidden">
        {activeTab === "home" && (
          <div className="p-6 space-y-6 animate-fade-in max-w-full overflow-x-hidden">
            {/* Notification Permission Prompt */}
            <NotificationPermission />
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {patientName}
              </h1>
              <p className="text-muted-foreground">
                Here's your health overview for today
              </p>
            </div>

            {/* Next Dose Widget */}
            <NextDoseWidget />

            {/* Status Cards */}
            <StatusCards />

            {/* Medicine Schedule - New Production-Ready View */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Today's Medicine Schedule
              </h2>
              <TodayScheduleView />
            </div>

            {/* Adherence Analytics */}
            <AdherenceAreaChart />

            {/* Health Tips */}
            <HealthTips />
          </div>
        )}

        {activeTab === "profile" && (
          <div className="p-6 animate-fade-in">
            <ProfileSettings />
          </div>
        )}

        {activeTab === "nearby" && (
          <div className="p-6 animate-fade-in">
            <NearbyServices />
          </div>
        )}

        {activeTab === "form" && (
          <div className="p-6 animate-fade-in">
            <UpdateProfileForm />
          </div>
        )}
      </main>
      
      {/* Install App Prompt */}
      <InstallPrompt />
    </div>
  );
};

export default PatientDashboard;
