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
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // User not authenticated, redirect to auth page
          navigate("/auth");
          return;
        }

        // Check user role
        const { data: roleData, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error || !roleData) {
          // No role assigned, redirect to auth
          navigate("/auth");
          return;
        }

        if (roleData.role !== allowedRole) {
          // Wrong role, redirect to appropriate dashboard
          if (roleData.role === "patient") {
            navigate("/patient-dashboard");
          } else if (roleData.role === "doctor") {
            navigate("/doctor-dashboard");
          } else if (roleData.role === "hospital") {
            navigate("/hospital-dashboard");
          } else {
            navigate("/");
          }
          return;
        }

        // Correct role, allow access
        setIsAuthorized(true);
        setIsChecking(false);
      } catch (error) {
        console.error("Error in role check:", error);
        navigate("/auth");
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
