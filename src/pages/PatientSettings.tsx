import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PushSubscriptionStatus } from "@/components/notifications/PushSubscriptionStatus";

const PatientSettings = () => {
  const { toast } = useToast();
  const [profileId, setProfileId] = useState<string>("");
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('patient_profiles')
        .select('id, push_notifications_enabled, email_notifications_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setProfileId(profile.id);
        setPushNotificationsEnabled(profile.push_notifications_enabled ?? true);
        setEmailNotificationsEnabled(profile.email_notifications_enabled ?? true);
      }
    };

    fetchProfile();
  }, []);

  const handleTogglePushNotifications = async (enabled: boolean) => {
    const { error } = await supabase
      .from('patient_profiles')
      .update({ push_notifications_enabled: enabled })
      .eq('id', profileId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    } else {
      setPushNotificationsEnabled(enabled);
      toast({
        title: enabled ? "Push Notifications Enabled" : "Push Notifications Disabled",
        description: enabled 
          ? "You'll receive medicine reminders on this device" 
          : "Medicine reminders are now turned off",
      });

      // Check browser permission if enabling
      if (enabled && typeof Notification !== 'undefined') {
        if (Notification.permission === 'denied') {
          toast({
            title: "Browser Permissions Required",
            description: "Please enable notifications in your browser settings to receive reminders",
            variant: "destructive",
          });
        } else if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission === 'denied') {
            toast({
              title: "Notifications Blocked",
              description: "You've blocked notifications. Enable them in browser settings to receive reminders",
              variant: "destructive",
            });
          }
        }
      }
    }
  };

  const handleToggleEmailNotifications = async (enabled: boolean) => {
    const { error } = await supabase
      .from('patient_profiles')
      .update({ email_notifications_enabled: enabled })
      .eq('id', profileId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    } else {
      setEmailNotificationsEnabled(enabled);
      toast({
        title: enabled ? "Email Notifications Enabled" : "Email Notifications Disabled",
        description: enabled 
          ? "You'll receive daily email summaries" 
          : "Email summaries are now turned off",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your app preferences and notification settings
        </p>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notification Settings
          </CardTitle>
          <CardDescription>Manage how you receive reminders and updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <Label htmlFor="push-notifications" className="text-base font-medium">
                Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive reminders when it's time to take your medicine
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={pushNotificationsEnabled}
              onCheckedChange={handleTogglePushNotifications}
            />
          </div>

          {pushNotificationsEnabled && <PushSubscriptionStatus />}

          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <Label htmlFor="email-notifications" className="text-base font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Get daily email summaries of your medicine adherence
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotificationsEnabled}
              onCheckedChange={handleToggleEmailNotifications}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientSettings;
