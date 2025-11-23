import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function NotificationSettings() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    checkPushPermission();
  }, []);

  const checkPushPermission = () => {
    if ("Notification" in window) {
      setPushPermission(Notification.permission);
    }
  };

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("patient_profiles")
        .select("push_notifications_enabled, email_notifications_enabled")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setPushEnabled(profile.push_notifications_enabled ?? true);
        setEmailEnabled(profile.email_notifications_enabled ?? true);
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (field: string, value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("patient_profiles")
        .update({ [field]: value })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Settings updated");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled && "Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      
      if (permission !== "granted") {
        toast.error("Please allow notifications in your browser settings");
        return;
      }
    }

    setPushEnabled(enabled);
    await updateSetting("push_notifications_enabled", enabled);
  };

  const handleEmailToggle = async (enabled: boolean) => {
    setEmailEnabled(enabled);
    await updateSetting("email_notifications_enabled", enabled);
  };

  const sendTestEmail = async () => {
    setIsSendingTest(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to send test email");
        return;
      }

      const { error } = await supabase.functions.invoke("send-medicine-email", {
        body: { userId: user.id }
      });

      if (error) throw error;

      toast.success("Test email sent! Check your inbox.");
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error("Failed to send test email");
    } finally {
      setIsSendingTest(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage how you receive medicine reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Push Notifications */}
        <div className="flex items-start justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="push-notifications" className="text-base font-medium">
                Push Notifications
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Get browser notifications when it's time to take your medicine
            </p>
            {pushPermission === "denied" && (
              <p className="text-xs text-destructive mt-1">
                ⚠️ Notifications blocked. Please enable in browser settings.
              </p>
            )}
            {pushPermission === "granted" && pushEnabled && (
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" /> Enabled
              </p>
            )}
          </div>
          <Switch
            id="push-notifications"
            checked={pushEnabled}
            onCheckedChange={handlePushToggle}
            disabled={pushPermission === "denied"}
          />
        </div>

        {/* Email Notifications */}
        <div className="flex items-start justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="email-notifications" className="text-base font-medium">
                Email Reminders
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Receive daily email summaries of your medicine schedule
            </p>
            {emailEnabled && (
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" /> Enabled
              </p>
            )}
          </div>
          <Switch
            id="email-notifications"
            checked={emailEnabled}
            onCheckedChange={handleEmailToggle}
          />
        </div>

        {/* Test Email Button */}
        {emailEnabled && (
          <div className="pt-4 border-t">
            <Button
              onClick={sendTestEmail}
              disabled={isSendingTest}
              variant="outline"
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSendingTest ? "Sending..." : "Send Test Email"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Test the email notification to see what it looks like
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
