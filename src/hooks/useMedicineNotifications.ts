import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ScheduledNotification {
  occurrenceId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: Date;
  notified: boolean;
  reminderSent: boolean;
}

interface ServiceWorkerMessage {
  type: string;
  data: {
    occurrenceId: string;
    medicineName: string;
  };
}

export function useMedicineNotifications(
  schedules: Array<{
    occurrenceId: string;
    medicineName: string;
    dosage: string;
    scheduledDateTimeISO: string;
    status: string;
  }>
) {
  const notificationMap = useRef<Map<string, ScheduledNotification>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout>();
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);

  useEffect(() => {
    // Check for service worker support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setServiceWorkerReady(true);
        console.log('Service Worker ready for notifications');
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      };
    }

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          toast.success("Notifications enabled for medicine reminders");
        }
      });
    }

    // Initialize notification map
    schedules.forEach((schedule) => {
      if (!notificationMap.current.has(schedule.occurrenceId)) {
        notificationMap.current.set(schedule.occurrenceId, {
          occurrenceId: schedule.occurrenceId,
          medicineName: schedule.medicineName,
          dosage: schedule.dosage,
          scheduledTime: new Date(schedule.scheduledDateTimeISO),
          notified: false,
          reminderSent: false,
        });
      }
    });

    // Check notifications every minute
    intervalRef.current = setInterval(() => {
      checkAndSendNotifications();
    }, 60 * 1000); // Check every minute

    // Initial check
    checkAndSendNotifications();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [schedules]);

  const checkAndSendNotifications = () => {
    const now = new Date();

    notificationMap.current.forEach((notification, occurrenceId) => {
      const schedule = schedules.find((s) => s.occurrenceId === occurrenceId);
      
      // Skip if already taken
      if (schedule?.status === "Taken") {
        return;
      }

      const minutesSinceScheduled = (now.getTime() - notification.scheduledTime.getTime()) / 1000 / 60;

      // Send notification at scheduled time (within 1 minute window)
      if (!notification.notified && minutesSinceScheduled >= 0 && minutesSinceScheduled < 1) {
        sendNotification(
          `Time to take ${notification.medicineName}`,
          `${notification.dosage} — Tap to open`,
          occurrenceId
        );
        notification.notified = true;
        notificationMap.current.set(occurrenceId, notification);
      }

      // Send reminder 5 minutes after scheduled time if not taken
      if (
        notification.notified &&
        !notification.reminderSent &&
        minutesSinceScheduled >= 5 &&
        minutesSinceScheduled < 6
      ) {
        sendNotification(
          `Reminder: ${notification.medicineName}`,
          "It's been 5 minutes since scheduled time",
          occurrenceId
        );
        notification.reminderSent = true;
        notificationMap.current.set(occurrenceId, notification);
      }
    });
  };

  const handleServiceWorkerMessage = (event: MessageEvent<ServiceWorkerMessage>) => {
    const { type, data } = event.data;

    if (type === 'MARK_MEDICINE_TAKEN') {
      toast.success(`Marked ${data.medicineName} as taken`);
      // You can add logic here to update the backend
    } else if (type === 'SNOOZE_MEDICINE') {
      toast.info(`Snoozed ${data.medicineName} for 10 minutes`);
      // Reschedule notification
    }
  };

  const sendNotification = (title: string, body: string, occurrenceId: string) => {
    const schedule = schedules.find(s => s.occurrenceId === occurrenceId);
    
    // Try Service Worker push notification first (works even when app is closed)
    if (serviceWorkerReady && 'serviceWorker' in navigator && Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: occurrenceId,
          requireInteraction: true,
          data: {
            occurrenceId,
            medicineName: schedule?.medicineName || "Medicine",
            dosage: schedule?.dosage || "",
          }
        } as any);
      }).catch((error) => {
        console.error('Service Worker notification failed:', error);
        // Fallback to regular notification
        showFallbackNotification(title, body, occurrenceId);
      });
    } else {
      // Fallback for browsers without service worker support
      showFallbackNotification(title, body, occurrenceId);
    }

    // Always show in-app toast
    toast.info(title, {
      description: body,
      duration: 10000,
    });
  };

  const showFallbackNotification = (title: string, body: string, occurrenceId: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        body,
        icon: "/favicon.ico",
        tag: occurrenceId,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  return { sendNotification };
}
