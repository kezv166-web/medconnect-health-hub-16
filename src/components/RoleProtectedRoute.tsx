import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: "patient" | "doctor" | "hospital";
}

const RoleProtectedRoute = ({ children, allowedRole }: RoleProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkRoleAndAuth = async () => {
      try {
        // Check for mock auth sessions (doctor/hospital) - check both storage locations
        let mockRole = localStorage.getItem("mockRole") ?? sessionStorage.getItem("mockRole");
        
        // Sync to localStorage if found only in sessionStorage
        if (mockRole && !localStorage.getItem("mockRole")) {
          localStorage.setItem("mockRole", mockRole);
        }
        
        if (mockRole === "doctor" || mockRole === "hospital") {
          // Mock authentication for doctor/hospital
          if (mockRole === allowedRole) {
            setIsAuthorized(true);
            setIsChecking(false);
          } else {
            // Wrong mock role, redirect
            navigate(`/${mockRole}-dashboard`);
          }
          return;
        }

        // Real Supabase authentication for patients
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // User not authenticated, redirect to home
          navigate("/");
          return;
        }

        // Only patients use Supabase auth with roles
        if (allowedRole === "patient") {
          setIsAuthorized(true);
          setIsChecking(false);
        } else {
          // Trying to access doctor/hospital dashboard with patient auth
          navigate("/patient-dashboard");
        }
      } catch (error) {
        console.error("Error in role check:", error);
        navigate("/");
      }
    };

    checkRoleAndAuth();
  }, [navigate, allowedRole]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
