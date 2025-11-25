import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Loader2 } from "lucide-react";

export default function TestNotifications() {
  const [isTesting, setIsTesting] = useState(false);

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-medicine-reminders');
      
      if (error) throw error;
      
      toast.success('Test notification triggered!', {
        description: `Checked ${data?.schedulesChecked || 0} schedules, sent ${data?.notificationsSent || 0} notifications`,
      });
      
      console.log('Test notification result:', data);
    } catch (error: any) {
      console.error('Test notification error:', error);
      toast.error('Failed to send test notification', {
        description: error.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Test Medicine Notifications
          </CardTitle>
          <CardDescription>
            Manually trigger the medicine reminder system to test if notifications are working
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">How it works:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Checks all your scheduled medicines</li>
              <li>Sends notifications for medicines due within ±2 minutes of current time</li>
              <li>Works even if you haven't granted notification permissions</li>
              <li>View results in the browser console</li>
            </ul>
          </div>

          <Button 
            onClick={handleTestNotification} 
            disabled={isTesting}
            className="w-full"
            size="lg"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Test Notifications Now
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground">
            <p>💡 Tip: Add a medicine scheduled for current time + 2 minutes to test the notification system</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
