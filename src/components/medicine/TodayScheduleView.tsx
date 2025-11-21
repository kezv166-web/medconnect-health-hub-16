import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import TodayScheduleCard, { MedicineOccurrence, OccurrenceStatus } from "./TodayScheduleCard";
import { Sunrise, Sun, Sunset, Moon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DaypartConfig {
  value: "Morning" | "Afternoon" | "Evening" | "Night";
  label: string;
  subtitle: string;
  icon: typeof Sunrise;
  startHour: number;
  endHour: number;
}

const daypartConfig: DaypartConfig[] = [
  { 
    value: "Morning", 
    label: "Morning", 
    subtitle: "6:00 AM - 11:59 AM",
    icon: Sunrise,
    startHour: 6,
    endHour: 11
  },
  { 
    value: "Afternoon", 
    label: "Afternoon", 
    subtitle: "12:00 PM - 5:59 PM",
    icon: Sun,
    startHour: 12,
    endHour: 17
  },
  { 
    value: "Evening", 
    label: "Evening", 
    subtitle: "6:00 PM - 8:59 PM",
    icon: Sunset,
    startHour: 18,
    endHour: 20
  },
  { 
    value: "Night", 
    label: "Night", 
    subtitle: "9:00 PM - 5:59 AM",
    icon: Moon,
    startHour: 21,
    endHour: 29 // Represents 5:59 AM next day
  },
];

const timeSlotToDaypart = (timeSlot: string): "Morning" | "Afternoon" | "Evening" | "Night" | "Custom" => {
  const normalized = timeSlot.toLowerCase();
  if (normalized === "morning") return "Morning";
  if (normalized === "afternoon") return "Afternoon";
  if (normalized === "evening") return "Evening";
  if (normalized === "night") return "Night";
  return "Custom";
};

const parseScheduleTime = (timeSlot: string, scheduledTime?: string): string => {
  if (scheduledTime) return scheduledTime;
  
  const normalized = timeSlot.toLowerCase();
  switch (normalized) {
    case "morning":
      return "08:00 AM";
    case "afternoon":
      return "02:00 PM";
    case "evening":
      return "07:00 PM";
    case "night":
      return "09:00 PM";
    default:
      return "12:00 PM";
  }
};

const determineStatus = (scheduledDateTime: Date, takenAt: string | null): OccurrenceStatus => {
  if (takenAt) return "Taken";
  
  const now = new Date();
  const diffMinutes = (now.getTime() - scheduledDateTime.getTime()) / 1000 / 60;
  
  // Missed: more than 30 minutes past scheduled time
  if (diffMinutes > 30) return "Missed";
  
  // Due: within 5 minutes before or after scheduled time
  if (diffMinutes >= -5 && diffMinutes <= 30) return "Due";
  
  // Upcoming: more than 5 minutes before scheduled time
  return "Upcoming";
};

export default function TodayScheduleView() {
  const [occurrences, setOccurrences] = useState<MedicineOccurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTodaySchedule();
    
    // Refresh every 5 minutes while active
    const interval = setInterval(() => {
      fetchTodaySchedule();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchTodaySchedule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) {
        setLoading(false);
        return;
      }

      // Fetch schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from("medicine_schedules")
        .select("*")
        .eq("patient_id", profile.id);

      if (schedulesError) throw schedulesError;

      if (!schedulesData || schedulesData.length === 0) {
        setOccurrences([]);
        setLoading(false);
        return;
      }

      // Fetch today's intake logs
      const today = new Date().toISOString().split("T")[0];
      const { data: logsData } = await supabase
        .from("intake_logs")
        .select("schedule_id, status, log_date, created_at")
        .eq("log_date", today)
        .in("schedule_id", schedulesData.map((s) => s.id));

      const logsMap = new Map<string, { status: string; takenAt: string }>();
      logsData?.forEach((log) => {
        logsMap.set(log.schedule_id, {
          status: log.status,
          takenAt: log.created_at
        });
      });

      // Generate occurrences for today
      const todayOccurrences: MedicineOccurrence[] = schedulesData.map((schedule) => {
        const scheduledTimeLocal = parseScheduleTime(schedule.time_slot);
        const daypart = timeSlotToDaypart(schedule.time_slot);
        
        // Create a proper ISO datetime for today at the scheduled time
        const [time, period] = scheduledTimeLocal.split(" ");
        const [hours, minutes] = time.split(":");
        let hour = parseInt(hours);
        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;
        
        const scheduledDateTime = new Date();
        scheduledDateTime.setHours(hour, parseInt(minutes), 0, 0);
        
        const log = logsMap.get(schedule.id);
        const takenAt = log?.status === "taken" ? log.takenAt : null;
        const status = determineStatus(scheduledDateTime, takenAt);

        return {
          occurrenceId: schedule.id,
          medicineId: schedule.id,
          medicineName: schedule.medicine_name,
          dosage: schedule.dosage,
          scheduledDateTimeISO: scheduledDateTime.toISOString(),
          scheduledTimeLocal,
          daypart,
          status,
          takenAt,
          notes: null,
          sourceIntakeId: profile.id,
          instruction: schedule.instruction
        };
      });

      setOccurrences(todayOccurrences);
    } catch (error) {
      console.error("Error fetching today's schedule:", error);
      toast.error("Failed to load today's schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkTaken = async (occurrenceId: string) => {
    setSubmittingId(occurrenceId);
    
    try {
      const takenAt = new Date().toISOString();
      const today = new Date().toISOString().split("T")[0];

      // Optimistically update UI
      setOccurrences(prev => prev.map(occ => 
        occ.occurrenceId === occurrenceId
          ? { ...occ, status: "Taken" as OccurrenceStatus, takenAt }
          : occ
      ));

      // Insert or update intake log
      const { error } = await supabase.from("intake_logs").upsert({
        schedule_id: occurrenceId,
        status: "taken",
        log_date: today,
      }, {
        onConflict: "schedule_id,log_date"
      });

      if (error) throw error;

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast.success("Medicine intake recorded!");
      
      // Refresh to get server state
      await fetchTodaySchedule();
    } catch (error: any) {
      console.error("Error marking taken:", error);
      toast.error(error.message || "Failed to mark medicine as taken");
      
      // Revert optimistic update on error
      await fetchTodaySchedule();
    } finally {
      setSubmittingId(null);
    }
  };

  const groupedOccurrences = daypartConfig.map(daypart => ({
    ...daypart,
    occurrences: occurrences.filter(occ => occ.daypart === daypart.value)
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (occurrences.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No medicines scheduled</AlertTitle>
        <AlertDescription>
          You don't have any medicines scheduled for today. Add medicines in your profile to get started.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {groupedOccurrences.map((daypart) => {
        if (daypart.occurrences.length === 0) return null;
        
        const Icon = daypart.icon;
        
        return (
          <div key={daypart.value} className="space-y-4">
            {/* Daypart header */}
            <div className="flex items-center gap-3 pb-2 border-b border-border">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">{daypart.label}</h3>
                <p className="text-sm text-muted-foreground">{daypart.subtitle}</p>
              </div>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {daypart.occurrences.map((occurrence) => (
                <TodayScheduleCard
                  key={occurrence.occurrenceId}
                  occurrence={occurrence}
                  onMarkTaken={handleMarkTaken}
                  isSubmitting={submittingId === occurrence.occurrenceId}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
