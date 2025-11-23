import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import TodayScheduleCard, { MedicineOccurrence, OccurrenceStatus } from "./TodayScheduleCard";
import { Sunrise, Sun, Sunset, Moon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

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

      // Fetch medicine schedules
      const { data: schedulesData } = await supabase
        .from("medicine_schedules")
        .select("*")
        .eq("patient_id", profile.id);

      // Also fetch from medicines table
      const { data: medicinesData } = await supabase
        .from("medicines")
        .select("*")
        .eq("patient_id", profile.id);

      // Build a map from medicine name + dosage to time/period from medicines table
      const medicineTimeMap = new Map<string, { time: string | null; period: string | null }>();
      if (medicinesData && medicinesData.length > 0) {
        medicinesData.forEach((medicine) => {
          const key = `${medicine.medicine_name.toLowerCase()}|${medicine.dosage}`;
          medicineTimeMap.set(key, {
            time: medicine.time,
            period: medicine.period,
          });
        });
      }

      const allOccurrences: MedicineOccurrence[] = [];
      const scheduledMedicineNames = new Set<string>();

      // Process medicine_schedules
      if (schedulesData && schedulesData.length > 0) {
        const scheduleIds = schedulesData.map((s) => s.id);
        const today = new Date().toISOString().split("T")[0];
        
        const { data: logsData } = await supabase
          .from("intake_logs")
          .select("schedule_id, status, log_date, created_at")
          .eq("log_date", today)
          .in("schedule_id", scheduleIds);

        const logsMap = new Map<string, { status: string; takenAt: string }>();
        logsData?.forEach((log) => {
          logsMap.set(log.schedule_id, {
            status: log.status,
            takenAt: log.created_at
          });
        });

        schedulesData.forEach((schedule) => {
          const key = `${schedule.medicine_name.toLowerCase()}|${schedule.dosage}`;
          const medicineTime = medicineTimeMap.get(key);

          // Prefer the exact time from medicines table if available
          const baseTime = medicineTime?.time || "9:00";
          const basePeriod = medicineTime?.period || "AM";
          const scheduledTimeLocal = `${baseTime} ${basePeriod}`;

          // Determine daypart from actual time if we have it, otherwise from time_slot
          const [time, period] = scheduledTimeLocal.split(" ");
          const [hours, minutes] = time.split(":");
          let hour = parseInt(hours);
          if (period === "PM" && hour !== 12) hour += 12;
          if (period === "AM" && hour === 12) hour = 0;

          let daypart: "Morning" | "Afternoon" | "Evening" | "Night" = "Morning";
          if (hour >= 6 && hour < 12) daypart = "Morning";
          else if (hour >= 12 && hour < 18) daypart = "Afternoon";
          else if (hour >= 18 && hour < 21) daypart = "Evening";
          else daypart = "Night";
          
          const scheduledDateTime = new Date();
          scheduledDateTime.setHours(hour, parseInt(minutes), 0, 0);
          
          const log = logsMap.get(schedule.id);
          const takenAt = log?.status === "taken" ? log.takenAt : null;
          const status = determineStatus(scheduledDateTime, takenAt);

          scheduledMedicineNames.add(schedule.medicine_name.toLowerCase());

          allOccurrences.push({
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
            instruction: schedule.instruction,
            isActualSchedule: true
          });
        });
      }

      // Process medicines table - expand based on frequency (skip duplicates)
      if (medicinesData && medicinesData.length > 0) {
        medicinesData.forEach((medicine) => {
          // Skip if this medicine is already in schedules
          if (scheduledMedicineNames.has(medicine.medicine_name.toLowerCase())) {
            return;
          }

          const frequency = medicine.frequency.toLowerCase();
          const timing = medicine.timings.toLowerCase();
          
          // Use the actual time and period from medicine if available, otherwise use defaults
          const medicineTime = medicine.time || "9:00";
          const medicinePeriod = medicine.period || "AM";
          const medicineTimeFormatted = `${medicineTime} ${medicinePeriod}`;
          
          // Determine daypart from the time
          const [time, period] = medicineTimeFormatted.split(" ");
          const [hours] = time.split(":");
          let hour = parseInt(hours);
          if (period === "PM" && hour !== 12) hour += 12;
          if (period === "AM" && hour === 12) hour = 0;
          
          let determinedDaypart: "Morning" | "Afternoon" | "Evening" | "Night" = "Morning";
          if (hour >= 6 && hour < 12) determinedDaypart = "Morning";
          else if (hour >= 12 && hour < 18) determinedDaypart = "Afternoon";
          else if (hour >= 18 && hour < 21) determinedDaypart = "Evening";
          else determinedDaypart = "Night";
          
          // Parse frequency to determine occurrences
          let occurrenceTimes: { time: string; daypart: "Morning" | "Afternoon" | "Evening" | "Night" }[] = [];
          
          if (frequency.includes("once")) {
            // Use the actual time from medicine
            occurrenceTimes.push({ time: medicineTimeFormatted, daypart: determinedDaypart });
          } else if (frequency.includes("twice")) {
            occurrenceTimes.push({ time: medicineTimeFormatted, daypart: determinedDaypart });
            occurrenceTimes.push({ time: "08:00 PM", daypart: "Evening" });
          } else if (frequency.includes("three")) {
            occurrenceTimes.push({ time: medicineTimeFormatted, daypart: determinedDaypart });
            occurrenceTimes.push({ time: "02:00 PM", daypart: "Afternoon" });
            occurrenceTimes.push({ time: "08:00 PM", daypart: "Evening" });
          }

          occurrenceTimes.forEach((occurrence, index) => {
            const [time, period] = occurrence.time.split(" ");
            const [hours, minutes] = time.split(":");
            let hour = parseInt(hours);
            if (period === "PM" && hour !== 12) hour += 12;
            if (period === "AM" && hour === 12) hour = 0;
            
            const scheduledDateTime = new Date();
            scheduledDateTime.setHours(hour, parseInt(minutes), 0, 0);
            
            const status = determineStatus(scheduledDateTime, null);

            allOccurrences.push({
              occurrenceId: `${medicine.id}-${index}`,
              medicineId: medicine.id,
              medicineName: medicine.medicine_name,
              dosage: medicine.dosage,
              scheduledDateTimeISO: scheduledDateTime.toISOString(),
              scheduledTimeLocal: occurrence.time,
              daypart: occurrence.daypart,
              status,
              takenAt: null,
              notes: null,
              sourceIntakeId: profile.id,
              instruction: timing.includes("before") ? "before_food" : "after_food",
              isActualSchedule: false
            });
          });
        });
      }

      setOccurrences(allOccurrences);
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

      // Check if log already exists
      const { data: existingLog } = await supabase
        .from("intake_logs")
        .select("id")
        .eq("schedule_id", occurrenceId)
        .eq("log_date", today)
        .maybeSingle();

      let error;
      if (existingLog) {
        // Update existing log
        const { error: updateError } = await supabase
          .from("intake_logs")
          .update({ status: "taken", taken_at: takenAt })
          .eq("id", existingLog.id);
        error = updateError;
      } else {
        // Insert new log
        const { error: insertError } = await supabase
          .from("intake_logs")
          .insert({
            schedule_id: occurrenceId,
            status: "taken",
            log_date: today,
            taken_at: takenAt
          });
        error = insertError;
      }

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

            {/* Cards in carousel */}
            <div className="relative px-12">
              <Carousel className="w-full" opts={{ align: "start" }}>
                <CarouselContent className="-ml-4">
                  {daypart.occurrences.map((occurrence) => (
                    <CarouselItem key={occurrence.occurrenceId} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <TodayScheduleCard
                        occurrence={occurrence}
                        onMarkTaken={handleMarkTaken}
                        isSubmitting={submittingId === occurrence.occurrenceId}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {daypart.occurrences.length > 1 && (
                  <>
                    <CarouselPrevious className="-left-12" />
                    <CarouselNext className="-right-12" />
                  </>
                )}
              </Carousel>
            </div>
          </div>
        );
      })}
    </div>
  );
}
