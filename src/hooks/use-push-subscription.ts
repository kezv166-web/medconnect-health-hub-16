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
        
        // Request permission
        try {
          const permission = await Notification.requestPermission();
          console.log('[Push] Permission request result:', permission);
          
          if (permission !== 'granted') {
            toast({
              title: "Notification Permission Denied",
              description: "Please enable notifications in your browser settings",
              variant: "destructive",
            });
            return;
          }
        } catch (error) {
          console.error('[Push] Error requesting permission:', error);
          return;
        }
      }

      try {
      // Wait for service worker to be ready with longer timeout
      console.log('[Push] Waiting for service worker...');
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Service worker timeout')), 30000)
        )
      ]) as ServiceWorkerRegistration;
        
        console.log('[Push] Service worker ready, active:', registration.active?.state);
        
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

          console.log('[Push] VAPID key found, length:', publicVapidKey.length);
          console.log('[Push] Creating new push subscription...');
          
          try {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });
            console.log('[Push] ✅ Subscription created successfully');
            console.log('[Push] Subscription endpoint:', subscription.endpoint.substring(0, 50) + '...');
          } catch (subError) {
            console.error('[Push] Failed to create subscription:', subError);
            toast({
              title: "Subscription Failed",
              description: subError instanceof Error ? subError.message : "Could not create push subscription",
              variant: "destructive",
            });
            return;
          }
        }

        // Save subscription to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user && subscription) {
          const subscriptionJSON = subscription.toJSON();
          
          console.log('[Push] Saving subscription to database for user:', user.id);
          console.log('[Push] Subscription data:', {
            endpoint: subscriptionJSON.endpoint?.substring(0, 50) + '...',
            hasP256dh: !!subscriptionJSON.keys?.p256dh,
            hasAuth: !!subscriptionJSON.keys?.auth
          });
          
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
              description: "Failed to save push subscription: " + error.message,
              variant: "destructive",
            });
          } else {
            console.log('[Push] ✅ Push subscription saved successfully to database');
            toast({
              title: "Notifications Ready",
              description: "You'll receive medicine reminders on this device",
            });
          }
        } else {
          console.error('[Push] Missing user or subscription:', { hasUser: !!user, hasSubscription: !!subscription });
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
