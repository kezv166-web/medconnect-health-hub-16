import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SecondaryAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: 'doctor' | 'hospital';
  onSuccess: () => void;
}

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

const SecondaryAuthDialog = ({ open, onOpenChange, role, onSuccess }: SecondaryAuthDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const loginForm = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  const getRoleTitle = () => {
    return role === "doctor" ? "Doctor" : "Hospital Authority";
  };

  const handleSubmit = async (data: AuthFormData, mode: "login" | "signup") => {
    setIsLoading(true);
    setAuthError(null);

    try {
      if (mode === "login") {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) {
          const errorMsg = error.message.toLowerCase();
          if (errorMsg.includes('invalid') || 
              errorMsg.includes('not found') ||
              errorMsg.includes('no user') ||
              errorMsg.includes('wrong password')) {
            setAuthError("Email not registered or incorrect password. Please check your credentials or sign up.");
          } else if (errorMsg.includes('email not confirmed')) {
            setAuthError("Please verify your email address before logging in.");
          } else {
            setAuthError(error.message);
          }
          return;
        }

        if (authData.user) {
          // Set sessionStorage for role (to work with existing RoleProtectedRoute)
          sessionStorage.setItem("mockRole", role);
          onSuccess();
        }
      } else {
        // Sign up
        const redirectUrl = `${window.location.origin}/${role}-dashboard`;
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: { emailRedirectTo: redirectUrl },
        });

        if (error) {
          setAuthError(error.message.includes("already registered") 
            ? "Email already registered. Please login." 
            : error.message);
          return;
        }

        if (authData.user) {
          // Set sessionStorage for role (to work with existing RoleProtectedRoute)
          sessionStorage.setItem("mockRole", role);
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{getRoleTitle()} Authentication</DialogTitle>
          <DialogDescription>Complete your authentication with your email and password</DialogDescription>
        </DialogHeader>

        {authError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={loginForm.handleSubmit((data) => handleSubmit(data, "login"))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secondary-login-email">Email</Label>
                <Input
                  id="secondary-login-email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...loginForm.register("email")}
                  className="transition-all focus:ring-2 focus:ring-primary"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-login-password">Password</Label>
                <Input
                  id="secondary-login-password"
                  type="password"
                  placeholder="••••••••"
                  {...loginForm.register("password")}
                  className="transition-all focus:ring-2 focus:ring-primary"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Don't have an account? Switch to the <span className="font-semibold text-primary">Sign Up</span> tab above.
              </p>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signupForm.handleSubmit((data) => handleSubmit(data, "signup"))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secondary-signup-email">Email</Label>
                <Input
                  id="secondary-signup-email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...signupForm.register("email")}
                  className="transition-all focus:ring-2 focus:ring-primary"
                />
                {signupForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-signup-password">Password</Label>
                <Input
                  id="secondary-signup-password"
                  type="password"
                  placeholder="••••••••"
                  {...signupForm.register("password")}
                  className="transition-all focus:ring-2 focus:ring-primary"
                />
                {signupForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SecondaryAuthDialog;
