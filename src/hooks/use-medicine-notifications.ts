import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MedicineSchedule {
  id: string;
  medicine_name: string;
  dosage: string;
  time_slot: string;
  instruction?: string;
}

export const useMedicineNotifications = () => {
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const scheduleNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('patient_profiles')
          .select('id, push_notifications_enabled')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!profile || profile.push_notifications_enabled === false) {
          return;
        }

        const { data: schedules } = await supabase
          .from('medicine_schedules')
          .select('*')
          .eq('patient_id', profile.id);

        if (!schedules || schedules.length === 0) return;

        schedules.forEach((schedule: MedicineSchedule) => {
          const now = new Date();
          const scheduleTime = parseScheduleTime(schedule.time_slot);
          
          if (!scheduleTime) return;
          
          const notificationTime = new Date(scheduleTime.getTime() - 30 * 60 * 1000);
          const timeUntilNotification = notificationTime.getTime() - now.getTime();

          if (timeUntilNotification > 0 && timeUntilNotification < 24 * 60 * 60 * 1000) {
            setTimeout(() => {
              showMedicineNotification(schedule);
            }, timeUntilNotification);
          }
        });
      } catch (error) {
        console.error("Error scheduling notifications:", error);
      }
    };

    scheduleNotifications();
    const interval = setInterval(scheduleNotifications, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};

function parseScheduleTime(timeSlot: string): Date | null {
  const now = new Date();
  const defaults: Record<string, { hours: number; minutes: number }> = {
    morning: { hours: 8, minutes: 0 },
    afternoon: { hours: 14, minutes: 0 },
    evening: { hours: 18, minutes: 0 },
    night: { hours: 21, minutes: 0 },
  };

  const defaultTime = defaults[timeSlot];
  if (!defaultTime) return null;

  const time = new Date(now);
  time.setHours(defaultTime.hours, defaultTime.minutes, 0, 0);
  return time;
}

function showMedicineNotification(schedule: MedicineSchedule) {
  const notification = new Notification("⏰ Medicine Reminder", {
    body: `Time to take ${schedule.medicine_name} ${schedule.dosage}\n${schedule.instruction || ''}`,
    icon: "/pwa-192x192.png",
    badge: "/favicon.ico",
    tag: schedule.id,
    requireInteraction: true,
  });

  notification.onclick = () => {
    window.focus();
    window.location.href = '/patient-dashboard';
    notification.close();
  };
}
