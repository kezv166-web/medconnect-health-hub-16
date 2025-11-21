import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "./RoleSelector";

interface LoginFormProps {
  role: UserRole;
  onClose: () => void;
}

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

const LoginForm = ({ role, onClose }: LoginFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
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
    switch (role) {
      case "patient":
        return "Patient";
      case "doctor":
        return "Doctor";
      case "hospital":
        return "Hospital Authority";
      default:
        return "";
    }
  };

  const handleSubmit = async (data: AuthFormData, mode: "login" | "signup") => {
    setIsLoading(true);
    setAuthError(null);

    try {
      if (role === "patient") {
        // Real authentication for patient role
        if (mode === "login") {
          const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

          if (error) {
            setAuthError(error.message.includes("Invalid login") ? "Invalid email or password" : error.message);
            return;
          }

          if (authData.user) {
            toast({ title: "Welcome back!", description: "You've successfully logged in." });
            navigate("/patient-dashboard");
          }
        } else {
          const redirectUrl = `${window.location.origin}/patient-dashboard`;
          const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: { emailRedirectTo: redirectUrl },
          });

          if (error) {
            setAuthError(error.message.includes("already registered") ? "Email already registered. Please login." : error.message);
            return;
          }

          if (authData.user) {
            toast({ title: "Account created!", description: "Welcome to MedConnect." });
            navigate("/patient-onboarding");
          }
        }
      } else {
        // Mock authentication for doctor and hospital roles (not implemented yet)
        setTimeout(() => {
          toast({
            title: mode === "login" ? "Login Successful" : "Account Created",
            description: `Welcome to ${getRoleTitle()} Portal!`,
          });
          
          if (role === "doctor") {
            navigate("/doctor-dashboard");
          } else if (role === "hospital") {
            navigate("/hospital-dashboard");
          }
        }, 1500);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative shadow-xl border-primary/20">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 rounded-full"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>

      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{getRoleTitle()} Portal</CardTitle>
        <CardDescription>Enter your credentials to continue</CardDescription>
      </CardHeader>

      <CardContent>
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
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
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
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
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
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signupForm.handleSubmit((data) => handleSubmit(data, "signup"))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
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
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
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
      </CardContent>
    </Card>
  );
};

export default LoginForm;
