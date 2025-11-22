import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type TimeSlot = "morning" | "afternoon" | "evening" | "night";
type FoodInstruction = "before_food" | "after_food";

interface MedicineSetupFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const timeSlotLabels: { value: TimeSlot; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
];

export default function MedicineSetupForm({ onSuccess, onCancel }: MedicineSetupFormProps) {
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  const [instruction, setInstruction] = useState<FoodInstruction>("after_food");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTimeSlotToggle = (slot: TimeSlot) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!medicineName.trim() || !dosage.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (selectedTimeSlots.length === 0) {
      toast.error("Please select at least one timing slot");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user and patient profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const { data: profile } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) {
        toast.error("Patient profile not found");
        return;
      }

      // Create schedule entries for each selected time slot
      const schedules = selectedTimeSlots.map((timeSlot) => ({
        patient_id: profile.id,
        medicine_name: medicineName.trim(),
        dosage: dosage.trim(),
        time_slot: timeSlot,
        instruction,
      }));

      const { error } = await supabase
        .from("medicine_schedules")
        .insert(schedules);

      if (error) throw error;

      toast.success("Medicine schedule added successfully!");
      
      // Reset form
      setMedicineName("");
      setDosage("");
      setSelectedTimeSlots([]);
      setInstruction("after_food");
      
      onSuccess?.();
    } catch (error: any) {
      console.error("Error adding medicine schedule:", error);
      toast.error(error.message || "Failed to add medicine schedule");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="medicine-name">Medicine Name</Label>
        <Input
          id="medicine-name"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          placeholder="Enter medicine name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dosage">Dosage</Label>
        <Input
          id="dosage"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          placeholder="e.g., 500mg, 1 tablet"
          required
        />
      </div>

      <div className="space-y-3">
        <Label>Timing Slots</Label>
        <div className="grid grid-cols-2 gap-3">
          {timeSlotLabels.map(({ value, label }) => (
            <div
              key={value}
              className={`flex items-center space-x-3 rounded-lg border-2 p-4 transition-all ${
                selectedTimeSlots.includes(value)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Checkbox
                id={value}
                checked={selectedTimeSlots.includes(value)}
                onCheckedChange={() => handleTimeSlotToggle(value)}
              />
              <Label htmlFor={value} className="cursor-pointer font-medium">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Food Instruction</Label>
        <RadioGroup 
          value={instruction} 
          onValueChange={(value: string) => setInstruction(value as FoodInstruction)}
        >
          <div className="flex items-center space-x-2 p-3">
            <RadioGroupItem value="before_food" id="before_food" />
            <Label htmlFor="before_food" className="cursor-pointer">
              Before Food
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3">
            <RadioGroupItem value="after_food" id="after_food" />
            <Label htmlFor="after_food" className="cursor-pointer">
              After Food
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Adding..." : "Add Medicine"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
