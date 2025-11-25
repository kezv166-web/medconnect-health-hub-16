import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const usePushSubscription = () => {
  useEffect(() => {
    const subscribeToPush = async () => {
      console.log('[Push] Starting push subscription process...');
      
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.error('[Push] Push notifications not supported in this browser');
        toast({
          title: "Push Notifications Unavailable",
          description: "Your browser doesn't support push notifications",
          variant: "destructive",
        });
        return;
      }

      // Check if notifications are granted
      if (Notification.permission !== 'granted') {
        console.log('[Push] Notification permission not granted:', Notification.permission);
        return;
      }

      try {
        // Wait for service worker to be ready with timeout
        console.log('[Push] Waiting for service worker...');
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Service worker timeout')), 10000)
          )
        ]) as ServiceWorkerRegistration;
        
        console.log('[Push] Service worker ready');
        
        // Check if already subscribed
        let subscription = await registration.pushManager.getSubscription();
        console.log('[Push] Existing subscription:', subscription ? 'Found' : 'Not found');
        
        if (!subscription) {
          // Subscribe to push notifications
          const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
          
          if (!publicVapidKey) {
            console.error('[Push] VAPID public key not configured');
            toast({
              title: "Configuration Error",
              description: "Push notification keys are not configured",
              variant: "destructive",
            });
            return;
          }

          console.log('[Push] Creating new push subscription...');
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          });
          console.log('[Push] Subscription created successfully');
        }

        // Save subscription to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user && subscription) {
          const subscriptionJSON = subscription.toJSON();
          
          console.log('[Push] Saving subscription to database for user:', user.id);
          const { error } = await supabase.from('push_subscriptions').upsert({
            user_id: user.id,
            endpoint: subscriptionJSON.endpoint!,
            p256dh: subscriptionJSON.keys!.p256dh,
            auth: subscriptionJSON.keys!.auth
          }, {
            onConflict: 'endpoint'
          });

          if (error) {
            console.error('[Push] Database save error:', error);
            toast({
              title: "Subscription Error",
              description: "Failed to save push subscription",
              variant: "destructive",
            });
          } else {
            console.log('[Push] ✅ Push subscription saved successfully');
            toast({
              title: "Notifications Ready",
              description: "You'll receive medicine reminders on this device",
            });
          }
        }
      } catch (error) {
        console.error('[Push] Error subscribing to push:', error);
        toast({
          title: "Subscription Failed",
          description: error instanceof Error ? error.message : "Failed to set up push notifications",
          variant: "destructive",
        });
      }
    };

    subscribeToPush();
  }, []);
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
