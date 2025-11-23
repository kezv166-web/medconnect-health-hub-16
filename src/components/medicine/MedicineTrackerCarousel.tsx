import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Sunrise, Sun, Sunset, Moon, Pill } from "lucide-react";

type TimeSlot = "morning" | "afternoon" | "evening" | "night";

interface MedicineSchedule {
  id: string;
  medicine_name: string;
  dosage: string;
  time_slot: TimeSlot;
  instruction: string;
  taken?: boolean;
  missed?: boolean;
}

const timeSlotConfig = [
  { value: "morning" as TimeSlot, label: "Morning", icon: Sunrise, time: "6:00 AM - 11:59 AM" },
  { value: "afternoon" as TimeSlot, label: "Afternoon", icon: Sun, time: "12:00 PM - 5:59 PM" },
  { value: "evening" as TimeSlot, label: "Evening", icon: Sunset, time: "6:00 PM - 8:59 PM" },
  { value: "night" as TimeSlot, label: "Night", icon: Moon, time: "9:00 PM - 5:59 AM" },
];

const getCurrentTimeSlot = (): TimeSlot => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 21) return "evening";
  return "night";
};

const getTimeSlotIndex = (slot: TimeSlot): number => {
  return timeSlotConfig.findIndex((config) => config.value === slot);
};

export default function MedicineTrackerCarousel() {
  const [schedules, setSchedules] = useState<MedicineSchedule[]>([]);
  const [intakeLogs, setIntakeLogs] = useState<Record<string, boolean>>({});
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const hasScrolled = useRef(false);

  useEffect(() => {
    fetchSchedulesAndLogs();
  }, []);

  useEffect(() => {
    if (carouselApi && !hasScrolled.current && schedules.length > 0) {
      const currentSlot = getCurrentTimeSlot();
      const currentIndex = getTimeSlotIndex(currentSlot);
      carouselApi.scrollTo(currentIndex);
      hasScrolled.current = true;
    }
  }, [carouselApi, schedules]);

  const fetchSchedulesAndLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) return;

      // Fetch schedules
      const { data: schedulesData } = await supabase
        .from("medicine_schedules")
        .select("*")
        .eq("patient_id", profile.id);

      if (schedulesData) {
        setSchedules(schedulesData);

        // Fetch today's intake logs
        const today = new Date().toISOString().split("T")[0];
        const { data: logsData } = await supabase
          .from("intake_logs")
          .select("schedule_id, status")
          .eq("log_date", today)
          .in("schedule_id", schedulesData.map((s) => s.id));

        if (logsData) {
          const logsMap: Record<string, boolean> = {};
          logsData.forEach((log) => {
            logsMap[log.schedule_id] = log.status === "taken";
          });
          setIntakeLogs(logsMap);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleMarkDone = async (schedule: MedicineSchedule) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { error } = await supabase.from("intake_logs").insert({
        schedule_id: schedule.id,
        status: "taken",
        log_date: today,
      });

      if (error) throw error;

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Update local state
      setIntakeLogs((prev) => ({ ...prev, [schedule.id]: true }));
      toast.success("Medicine intake recorded!");
    } catch (error: any) {
      console.error("Error logging intake:", error);
      toast.error(error.message || "Failed to log intake");
    }
  };

  const isMissed = (timeSlot: TimeSlot, scheduleId: string): boolean => {
    const currentSlot = getCurrentTimeSlot();
    const currentIndex = getTimeSlotIndex(currentSlot);
    const slotIndex = getTimeSlotIndex(timeSlot);
    const isTaken = intakeLogs[scheduleId];

    // If already taken, not missed
    if (isTaken) return false;

    // If current time is past this slot, it's missed
    return currentIndex > slotIndex;
  };

  const getSchedulesForSlot = (slot: TimeSlot): MedicineSchedule[] => {
    return schedules.filter((s) => s.time_slot === slot);
  };

  return (
    <div className="relative">
      <Carousel setApi={setCarouselApi} className="w-full">
        <CarouselContent>
          {timeSlotConfig.map((config) => {
            const slotSchedules = getSchedulesForSlot(config.value);
            const Icon = config.icon;

            return (
              <CarouselItem key={config.value} className="md:basis-1/2 lg:basis-1/3">
                <Card className="p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{config.label}</h3>
                      <p className="text-xs text-muted-foreground">{config.time}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {slotSchedules.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No medicines scheduled
                      </p>
                    ) : (
                      slotSchedules.map((schedule) => {
                        const taken = intakeLogs[schedule.id];
                        const missed = isMissed(config.value, schedule.id);

                        return (
                          <div
                            key={schedule.id}
                            className="p-4 rounded-lg border bg-card space-y-3"
                          >
                            <div className="flex items-start gap-2">
                              <Pill className="w-4 h-4 mt-1 text-primary" />
                              <div className="flex-1">
                                <h4 className="font-medium">{schedule.medicine_name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {schedule.dosage}
                                </p>
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {schedule.instruction.replace("_", " ")}
                                </Badge>
                              </div>
                            </div>

                            {taken ? (
                              <Button
                                variant="default"
                                className="w-full bg-primary hover:bg-primary/90"
                                disabled
                              >
                                ✓ Intaked
                              </Button>
                            ) : missed ? (
                              <Button
                                variant="outline"
                                className="w-full border-red-500 text-red-500 hover:bg-red-50"
                                disabled
                              >
                                Missed
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handleMarkDone(schedule)}
                              >
                                Mark Done
                              </Button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
