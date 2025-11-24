import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const usePushSubscription = () => {
  useEffect(() => {
    const subscribeToPush = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications not supported');
        return;
      }

      // Check if notifications are granted
      if (Notification.permission !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }

      try {
        // Wait for service worker to be ready
        const registration = await navigator.serviceWorker.ready;
        
        // Check if already subscribed
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          // Subscribe to push notifications
          const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
          
          if (!publicVapidKey) {
            console.error('VAPID public key not configured');
            return;
          }

          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          });
        }

        // Save subscription to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user && subscription) {
          const subscriptionJSON = subscription.toJSON();
          
          await supabase.from('push_subscriptions').upsert({
            user_id: user.id,
            endpoint: subscriptionJSON.endpoint!,
            p256dh: subscriptionJSON.keys!.p256dh,
            auth: subscriptionJSON.keys!.auth
          }, {
            onConflict: 'endpoint'
          });

          console.log('Push subscription saved successfully');
        }
      } catch (error) {
        console.error('Error subscribing to push:', error);
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
