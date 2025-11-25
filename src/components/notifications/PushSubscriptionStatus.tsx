import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const PushSubscriptionStatus = () => {
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    active: boolean;
    endpoint?: string;
    error?: string;
  }>({ active: false });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        setSubscriptionStatus({ active: false, error: error.message });
      } else if (data) {
        setSubscriptionStatus({ active: true, endpoint: data.endpoint });
      } else {
        setSubscriptionStatus({ active: false });
      }
    } catch (error) {
      setSubscriptionStatus({ 
        active: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const refreshSubscription = async () => {
    setIsRefreshing(true);
    console.log('[PushStatus] Starting refresh subscription...');
    
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications not supported');
      }

      console.log('[PushStatus] Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('[PushStatus] Permission result:', permission);
      
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      console.log('[PushStatus] Waiting for service worker...');
      const registration = await navigator.serviceWorker.ready;
      console.log('[PushStatus] Service worker ready');
      
      let subscription = await registration.pushManager.getSubscription();
      console.log('[PushStatus] Existing subscription:', subscription ? 'Found, unsubscribing...' : 'None');

      if (subscription) {
        await subscription.unsubscribe();
        console.log('[PushStatus] Unsubscribed from old subscription');
      }

      const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) {
        throw new Error('VAPID key not configured');
      }

      console.log('[PushStatus] Creating new subscription with VAPID key...');
      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });
      console.log('[PushStatus] ✅ New subscription created');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('[PushStatus] Saving to database for user:', user.id);
      const subscriptionJSON = subscription.toJSON();
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscriptionJSON.endpoint!,
        p256dh: subscriptionJSON.keys!.p256dh,
        auth: subscriptionJSON.keys!.auth
      }, {
        onConflict: 'endpoint'
      });

      if (error) {
        console.error('[PushStatus] Database error:', error);
        throw error;
      }

      console.log('[PushStatus] ✅ Subscription saved to database');
      toast({
        title: "Subscription Refreshed",
        description: "Push notifications are now active",
      });

      await checkSubscription();
    } catch (error) {
      console.error('[PushStatus] Refresh failed:', error);
      toast({
        title: "Refresh Failed",
        description: error instanceof Error ? error.message : "Failed to refresh subscription",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  return (
    <Alert className={subscriptionStatus.active ? "border-green-500" : "border-yellow-500"}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {subscriptionStatus.active ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
          )}
          <div className="flex-1">
            <AlertDescription>
              <div className="font-medium mb-1">
                {subscriptionStatus.active ? "Push Subscription Active" : "Push Subscription Inactive"}
              </div>
              {subscriptionStatus.active && subscriptionStatus.endpoint && (
                <div className="text-xs text-muted-foreground font-mono truncate">
                  {subscriptionStatus.endpoint.substring(0, 50)}...
                </div>
              )}
              {subscriptionStatus.error && (
                <div className="text-xs text-destructive mt-1">
                  Error: {subscriptionStatus.error}
                </div>
              )}
              {!subscriptionStatus.active && !subscriptionStatus.error && (
                <div className="text-xs text-muted-foreground mt-1">
                  No active push subscription found. Click refresh to activate.
                </div>
              )}
            </AlertDescription>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshSubscription}
          disabled={isRefreshing}
          className="ml-2"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </Alert>
  );
};
