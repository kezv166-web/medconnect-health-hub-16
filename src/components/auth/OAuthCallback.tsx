import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          throw new Error("No user session found");
        }

        const user = session.user;
        const pendingRole = localStorage.getItem('pending_oauth_role') as 'patient' | 'doctor' | 'hospital' | null;
        
        if (!pendingRole) {
          throw new Error("No role specified for authentication");
        }
        
        // Check if user already has a role
        const { data: existingRole, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (roleError) {
          console.error("Error fetching role:", roleError);
        }
        
        // Cross-portal conflict check
        if (existingRole && existingRole.role !== pendingRole) {
          await supabase.auth.signOut();
          localStorage.removeItem('pending_oauth_role');
          
          const roleNames = {
            patient: 'Patient',
            doctor: 'Doctor',
            hospital: 'Hospital Authority'
          };
          
          toast({
            title: "Account Conflict",
            description: `This Google account is already registered as ${roleNames[existingRole.role as keyof typeof roleNames]}. Please use the correct portal or sign in with a different account.`,
            variant: "destructive",
          });
          
          navigate('/');
          return;
        }
        
        // Assign role if it doesn't exist
        if (!existingRole) {
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: pendingRole
            });
          
          if (insertError) {
            throw insertError;
          }
        }
        
        // Clear pending role
        localStorage.removeItem('pending_oauth_role');
        
        // Show success message
        toast({
          title: "Authentication Successful",
          description: `Welcome to MedConnect!`,
        });
        
        // Navigate to appropriate dashboard
        if (pendingRole === 'patient') {
          // Check if patient profile exists
          const { data: profile } = await supabase
            .from('patient_profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (!profile) {
            navigate('/patient-onboarding');
          } else {
            navigate('/patient-dashboard');
          }
        } else {
          navigate(`/${pendingRole}-dashboard`);
        }
        
      } catch (error: any) {
        console.error("OAuth callback error:", error);
        setError(error.message || "Authentication failed");
        localStorage.removeItem('pending_oauth_role');
        
        toast({
          title: "Authentication Failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
        
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    };
    
    handleCallback();
  }, [navigate, toast]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">Authentication Error</div>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <div className="text-lg font-semibold">Completing authentication...</div>
        <p className="text-sm text-muted-foreground">Please wait while we set up your account</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
