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
        // Get current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // User not authenticated, redirect to home
          navigate("/");
          return;
        }

        if (allowedRole === "patient") {
          // For patient routes, only authentication is required
          setIsAuthorized(true);
          setIsChecking(false);
          return;
        }

        // For doctor/hospital routes, check backend role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (roleError) {
          console.error("Error fetching user role:", roleError);
        }

        const userRole = roleData?.role;

        if (userRole === allowedRole) {
          setIsAuthorized(true);
          setIsChecking(false);
        } else if (userRole) {
          // Redirect to their correct dashboard based on their actual role
          navigate(`/${userRole}-dashboard`);
        } else {
          // No role found – send them to patient dashboard by default
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
