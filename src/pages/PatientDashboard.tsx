import { Activity, User, Pill, MapPin, Bot } from "lucide-react";
import { useState } from "react";
import PatientSidebar from "@/components/dashboard/PatientSidebar";
import AdherenceGraph from "@/components/dashboard/AdherenceGraph";
import StatusCards from "@/components/dashboard/StatusCards";
import HealthTips from "@/components/dashboard/HealthTips";
import PrescriptionUpload from "@/components/dashboard/PrescriptionUpload";

type SidebarItem = "home" | "profile" | "medicines" | "nearby" | "ai";

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState<SidebarItem>("home");

  return (
    <div className="min-h-screen bg-background flex">
      <PatientSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 lg:ml-64">
        {activeTab === "home" && (
          <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, John
              </h1>
              <p className="text-muted-foreground">
                Here's your health overview for today
              </p>
            </div>

            {/* Status Cards */}
            <StatusCards />

            {/* Adherence Graph */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Medicine Adherence
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Your medication intake consistency over the last 7 days
              </p>
              <AdherenceGraph />
            </div>

            {/* Health Tips */}
            <HealthTips />

            {/* Prescription Upload */}
            <PrescriptionUpload />
          </div>
        )}

        {activeTab === "profile" && (
          <div className="p-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-4">My Profile</h1>
            <p className="text-muted-foreground">Profile section coming soon...</p>
          </div>
        )}

        {activeTab === "medicines" && (
          <div className="p-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-4">My Medicines</h1>
            <p className="text-muted-foreground">Medicines section coming soon...</p>
          </div>
        )}

        {activeTab === "nearby" && (
          <div className="p-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-4">Nearby Services</h1>
            <p className="text-muted-foreground">Nearby services section coming soon...</p>
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
