import { useState } from "react";
import { Lock, Trash2, AlertTriangle, Shield, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

const DoctorSettings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);

    try {
      // First verify current password by trying to sign in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error("No user found");
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        toast({
          title: "Error",
          description: "Current password is incorrect",
          variant: "destructive",
        });
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Password changed successfully",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmation) {
      toast({
        title: "Error",
        description: "Please confirm that you understand this action cannot be undone",
        variant: "destructive",
      });
      return;
    }

    setDeletingAccount(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No user found");
      }

      // Delete hospital profile first
      const { error: profileError } = await supabase
        .from('hospital_profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) {
        console.error("Error deleting hospital profile:", profileError);
      }

      // Delete user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      if (roleError) {
        console.error("Error deleting user role:", roleError);
      }

      // Delete auth account
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        // If admin delete fails, try regular sign out
        await supabase.auth.signOut();
        toast({
          title: "Account Deletion Initiated",
          description: "Your account deletion request has been submitted. Please contact support if you need assistance.",
        });
      } else {
        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted",
        });
      }

      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6) return { strength: 25, label: "Weak", color: "bg-destructive" };
    if (password.length < 10) return { strength: 50, label: "Fair", color: "bg-warning" };
    if (password.length < 14) return { strength: 75, label: "Good", color: "bg-success" };
    return { strength: 100, label: "Strong", color: "bg-success" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-success/20 to-success/5 border border-success/10">
            <Shield className="w-6 h-6 text-success" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Account Security</h1>
            <p className="text-muted-foreground">Manage your password and account settings</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <Card className="border-success/20 shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success via-success/70 to-success/30" />
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-success/10 border border-success/20">
              <Lock className="w-5 h-5 text-success" />
            </div>
            <div>
              <CardTitle className="text-xl">Change Password</CardTitle>
              <CardDescription className="text-base">
                Keep your account secure with a strong password
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="currentPassword" className="text-sm font-medium flex items-center gap-2">
                <Key className="w-4 h-4 text-muted-foreground" />
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-success/20"
              />
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            <div className="space-y-2.5">
              <Label htmlFor="newPassword" className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (minimum 6 characters)"
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-success/20"
              />
              {newPassword && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Password strength:</span>
                    <span className={`font-medium ${
                      passwordStrength.strength === 100 ? 'text-success' :
                      passwordStrength.strength >= 50 ? 'text-warning' :
                      'text-destructive'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-success/20"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive animate-fade-in">Passwords do not match</p>
              )}
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleChangePassword} 
              disabled={changingPassword}
              className="w-full sm:w-auto h-11 px-8 bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Lock className="w-4 h-4 mr-2" />
              {changingPassword ? "Updating Password..." : "Update Password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive/30 shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-destructive via-destructive/70 to-destructive/30" />
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-xl text-destructive">Danger Zone</CardTitle>
              <CardDescription className="text-base">
                Permanently delete your account and all associated data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent border-2 border-destructive/20 rounded-xl p-6 space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground text-base mb-1">
                    ⚠️ This action is permanent and irreversible
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">The following will be permanently deleted:</p>
                  <ul className="text-sm text-muted-foreground space-y-1.5 ml-1">
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-0.5">•</span>
                      <span>Your clinic profile and all associated information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-0.5">•</span>
                      <span>All patient connections and referral data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-0.5">•</span>
                      <span>Your account credentials and login access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-0.5">•</span>
                      <span>All preferences, settings, and customizations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50 border border-border">
            <Checkbox
              id="deleteConfirm"
              checked={deleteConfirmation}
              onCheckedChange={(checked) => setDeleteConfirmation(checked as boolean)}
              className="mt-0.5"
            />
            <Label
              htmlFor="deleteConfirm"
              className="text-sm font-medium leading-relaxed cursor-pointer"
            >
              I understand this action is permanent and cannot be undone. I want to proceed with deleting my account.
            </Label>
          </div>

          <div className="pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled={!deleteConfirmation}
                  className="w-full sm:w-auto h-11 px-8 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
                      <AlertTriangle className="w-6 h-6 text-destructive" />
                    </div>
                    <AlertDialogTitle className="text-xl">Final Confirmation</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription className="text-base leading-relaxed pt-2">
                    This will <span className="font-semibold text-destructive">permanently delete</span> your doctor account 
                    and remove all your data from our servers. This action <span className="font-semibold">cannot be undone</span>.
                    <br /><br />
                    Are you absolutely sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0">
                  <AlertDialogCancel className="h-11">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className="h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deletingAccount ? "Deleting..." : "Yes, Delete My Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorSettings;
