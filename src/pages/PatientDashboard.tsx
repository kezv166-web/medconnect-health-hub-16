import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import PatientSidebar from "@/components/dashboard/PatientSidebar";
import StatusCards from "@/components/dashboard/StatusCards";
import HealthTips from "@/components/dashboard/HealthTips";
import MedicineManagement from "@/pages/MedicineManagement";
import ProfileSettings from "@/pages/ProfileSettings";
import NearbyServices from "@/pages/NearbyServices";
import FloatingChatButton from "@/components/ai/FloatingChatButton";
import MedicineTrackerCarousel from "@/components/medicine/MedicineTrackerCarousel";
import NextDoseWidget from "@/components/medicine/NextDoseWidget";
import AdherenceAreaChart from "@/components/medicine/AdherenceAreaChart";

type SidebarItem = "home" | "profile" | "medicines" | "nearby" | "ai";

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState<SidebarItem>("home");
  const [patientName, setPatientName] = useState("Patient");

  useEffect(() => {
    const fetchPatientProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('patient_profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) {
          setPatientName(data.full_name.split(' ')[0]);
        }
      }
    };
    fetchPatientProfile();
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <PatientSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Floating AI Chat Button */}
      <FloatingChatButton />
      
      <main className="flex-1 lg:ml-64">
        {activeTab === "home" && (
          <div className="p-6 space-y-6 animate-fade-in">
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

            {/* Medicine Tracker Carousel */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Today's Medicine Tracker
              </h2>
              <MedicineTrackerCarousel />
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

        {activeTab === "medicines" && (
          <div className="p-6 animate-fade-in">
            <MedicineManagement />
          </div>
        )}

        {activeTab === "nearby" && (
          <div className="p-6 animate-fade-in">
            <NearbyServices />
          </div>
        )}

        {activeTab === "ai" && (
          <div className="p-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-4">AI Assistant</h1>
            <p className="text-muted-foreground">AI Assistant section coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
