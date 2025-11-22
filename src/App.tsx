import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PatientDashboard from "./pages/PatientDashboard";
import PatientOnboarding from "./pages/PatientOnboarding";
import DoctorDashboard from "./pages/DoctorDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/patient-onboarding" element={<PatientOnboarding />} />
          <Route 
            path="/patient-dashboard" 
            element={
              <RoleProtectedRoute allowedRole="patient">
                <PatientDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/doctor-dashboard" 
            element={
              <RoleProtectedRoute allowedRole="doctor">
                <DoctorDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/hospital-dashboard" 
            element={
              <RoleProtectedRoute allowedRole="hospital">
                <HospitalDashboard />
              </RoleProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
