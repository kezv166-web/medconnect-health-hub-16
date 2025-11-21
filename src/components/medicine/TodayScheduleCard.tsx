import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, Clock, Check } from "lucide-react";
import { format } from "date-fns";

export type OccurrenceStatus = "Upcoming" | "Due" | "Taken" | "Missed";

export interface MedicineOccurrence {
  occurrenceId: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  scheduledDateTimeISO: string;
  scheduledTimeLocal: string;
  daypart: "Morning" | "Afternoon" | "Evening" | "Night" | "Custom";
  status: OccurrenceStatus;
  takenAt: string | null;
  notes: string | null;
  sourceIntakeId: string;
  instruction?: string;
}

interface TodayScheduleCardProps {
  occurrence: MedicineOccurrence;
  onMarkTaken: (occurrenceId: string) => void;
  isSubmitting?: boolean;
}

export default function TodayScheduleCard({ 
  occurrence, 
  onMarkTaken,
  isSubmitting = false 
}: TodayScheduleCardProps) {
  const getStatusBadge = () => {
    switch (occurrence.status) {
      case "Taken":
        return (
          <Badge className="bg-success text-white">
            <Check className="w-3 h-3 mr-1" />
            Taken
          </Badge>
        );
      case "Missed":
        return (
          <Badge variant="destructive">
            Missed
          </Badge>
        );
      case "Due":
        return (
          <Badge className="bg-primary text-primary-foreground">
            Due Now
          </Badge>
        );
      case "Upcoming":
        return (
          <Badge variant="secondary" className="text-muted-foreground">
            Upcoming
          </Badge>
        );
      default:
        return null;
    }
  };

  const getButtonState = () => {
    if (occurrence.status === "Taken") {
      return {
        label: "✓ Medicine taken",
        disabled: true,
        variant: "default" as const,
        className: "bg-success hover:bg-success text-white cursor-not-allowed"
      };
    }
    
    if (occurrence.status === "Due") {
      return {
        label: "Medicine taken",
        disabled: false,
        variant: "default" as const,
        className: "bg-primary hover:bg-primary-dark text-primary-foreground"
      };
    }
    
    if (occurrence.status === "Missed") {
      return {
        label: "Mark as taken",
        disabled: false,
        variant: "outline" as const,
        className: "border-destructive text-destructive hover:bg-destructive/10"
      };
    }

    return {
      label: "Upcoming",
      disabled: true,
      variant: "outline" as const,
      className: "cursor-not-allowed opacity-50"
    };
  };

  const buttonState = getButtonState();

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 space-y-3">
        {/* Header with icon and status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <Pill className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground mb-1 truncate" title={occurrence.medicineName}>
                {occurrence.medicineName}
              </h4>
              <p className="text-sm text-muted-foreground">
                {occurrence.dosage}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Time and instruction */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">
              {occurrence.scheduledTimeLocal}
            </span>
          </div>
          {occurrence.instruction && (
            <Badge variant="outline" className="text-xs">
              {occurrence.instruction.replace(/_/g, " ")}
            </Badge>
          )}
          {occurrence.notes && (
            <p className="text-xs text-muted-foreground italic mt-1">
              {occurrence.notes}
            </p>
          )}
        </div>

        {/* Taken timestamp */}
        {occurrence.takenAt && (
          <p className="text-xs text-muted-foreground">
            Taken at {format(new Date(occurrence.takenAt), "h:mm a")}
          </p>
        )}

        {/* Action button */}
        <Button
          onClick={() => !buttonState.disabled && onMarkTaken(occurrence.occurrenceId)}
          disabled={buttonState.disabled || isSubmitting}
          variant={buttonState.variant}
          className={`w-full ${buttonState.className}`}
          aria-label={`${buttonState.label} for ${occurrence.medicineName}`}
        >
          {isSubmitting ? "Saving..." : buttonState.label}
        </Button>
      </CardContent>
    </Card>
  );
}
