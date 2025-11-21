import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // User not authenticated, redirect to home
          navigate("/");
          return;
        }

        // Check if profile exists
        const { data: profile, error } = await supabase
          .from("patient_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking profile:", error);
        }

        if (!profile) {
          // Profile doesn't exist, redirect to onboarding
          navigate("/patient-onboarding");
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        console.error("Error in profile check:", error);
        setIsChecking(false);
      }
    };

    checkProfile();
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
