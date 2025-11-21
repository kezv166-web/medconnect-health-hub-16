import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface ScheduledNotification {
  occurrenceId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: Date;
  notified: boolean;
  reminderSent: boolean;
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

  useEffect(() => {
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

  const sendNotification = (title: string, body: string, occurrenceId: string) => {
    // Browser notification
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

    // In-app toast notification
    toast.info(title, {
      description: body,
      duration: 10000,
    });
  };

  return { sendNotification };
}
