import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export const NotificationPermission = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [showPrompt, setShowPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      
      if (Notification.permission === "default") {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }
  }, []);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowPrompt(false);
      
      if (result === "granted") {
        toast({
          title: "✅ Notifications Enabled",
          description: "You'll receive medicine reminders even when the app is closed",
        });
        
        new Notification("MedConnect Medicine Reminder", {
          body: "You'll receive reminders like this when it's time to take your medicine",
          icon: "/pwa-192x192.png",
          badge: "/favicon.ico",
        });
      } else {
        toast({
          title: "Notifications Disabled",
          description: "You can enable them later in your profile settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Notification permission error:", error);
    }
  };

  if (!("Notification" in window) || !showPrompt) {
    return null;
  }

  return (
    <Card className="p-4 mb-6 border-primary/20 bg-primary/5">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-full">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Enable Medicine Reminders</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Get notified when it's time to take your medicine - even when the app is closed
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={requestPermission}>
              Enable Notifications
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowPrompt(false)}>
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
