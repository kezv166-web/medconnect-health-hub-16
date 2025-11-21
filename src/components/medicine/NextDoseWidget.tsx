import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Pill } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type TimeSlot = "morning" | "afternoon" | "evening" | "night";

interface NextDose {
  medicine_name: string;
  dosage: string;
  time_slot: TimeSlot;
  instruction: string;
}

const timeSlotLabels: Record<TimeSlot, string> = {
  morning: "Morning (6:00 AM - 11:59 AM)",
  afternoon: "Afternoon (12:00 PM - 5:59 PM)",
  evening: "Evening (6:00 PM - 8:59 PM)",
  night: "Night (9:00 PM - 5:59 AM)",
};

const getCurrentTimeSlot = (): TimeSlot => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 21) return "evening";
  return "night";
};

const getNextTimeSlot = (current: TimeSlot): TimeSlot => {
  const order: TimeSlot[] = ["morning", "afternoon", "evening", "night"];
  const currentIndex = order.indexOf(current);
  return order[(currentIndex + 1) % 4];
};

export default function NextDoseWidget() {
  const [nextDose, setNextDose] = useState<NextDose | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNextDose();
    // Refresh every minute
    const interval = setInterval(fetchNextDose, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNextDose = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) return;

      // Get current time slot
      const currentSlot = getCurrentTimeSlot();
      const nextSlot = getNextTimeSlot(currentSlot);

      // Check if there are any medicines in the current slot not yet taken
      const today = new Date().toISOString().split("T")[0];

      const { data: currentSchedules } = await supabase
        .from("medicine_schedules")
        .select("*")
        .eq("patient_id", profile.id)
        .eq("time_slot", currentSlot);

      if (currentSchedules && currentSchedules.length > 0) {
        // Check if any are not taken yet
        const { data: logs } = await supabase
          .from("intake_logs")
          .select("schedule_id")
          .eq("log_date", today)
          .in("schedule_id", currentSchedules.map((s) => s.id));

        const takenIds = new Set(logs?.map((l) => l.schedule_id) || []);
        const untakenSchedule = currentSchedules.find((s) => !takenIds.has(s.id));

        if (untakenSchedule) {
          setNextDose(untakenSchedule);
          setIsLoading(false);
          return;
        }
      }

      // If all current slot medicines are taken, get next slot
      const { data: nextSchedules } = await supabase
        .from("medicine_schedules")
        .select("*")
        .eq("patient_id", profile.id)
        .eq("time_slot", nextSlot)
        .limit(1);

      if (nextSchedules && nextSchedules.length > 0) {
        setNextDose(nextSchedules[0]);
      } else {
        setNextDose(null);
      }
    } catch (error) {
      console.error("Error fetching next dose:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary/20">
            <Clock className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!nextDose) {
    return (
      <Card className="p-6 bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/20">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-green-500/20">
            <Pill className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-green-700">All caught up!</p>
            <p className="text-sm text-muted-foreground">
              No upcoming medicines scheduled
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-primary/20 animate-pulse">
          <Clock className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">Next Dose</p>
          <h3 className="font-bold text-lg">{nextDose.medicine_name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {nextDose.dosage}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {timeSlotLabels[nextDose.time_slot]}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {nextDose.instruction.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
