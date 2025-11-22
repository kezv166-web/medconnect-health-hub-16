import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ClockPickerProps {
  value?: string;
  onChange: (time: string) => void;
  className?: string;
}

export function ClockPicker({ value, onChange, className }: ClockPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"hours" | "minutes">("hours");
  const [hours, setHours] = useState(9);
  const [minutes, setMinutes] = useState(0);
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  useEffect(() => {
    if (value) {
      const [time, periodValue] = value.split(" ");
      const [h, m] = time.split(":");
      setHours(parseInt(h));
      setMinutes(parseInt(m));
      if (periodValue) setPeriod(periodValue as "AM" | "PM");
    }
  }, [value]);

  const handleHourClick = (hour: number) => {
    setHours(hour);
    setMode("minutes");
  };

  const handleMinuteClick = (minute: number) => {
    setMinutes(minute);
  };

  const handleDone = () => {
    const formattedTime = `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
    onChange(formattedTime);
    setIsOpen(false);
  };

  const renderClockFace = () => {
    const items = mode === "hours" ? Array.from({ length: 12 }, (_, i) => i + 1) : Array.from({ length: 12 }, (_, i) => i * 5);
    
    return (
      <div className="relative w-64 h-64 rounded-full bg-primary/10">
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />
        
        {/* Clock numbers */}
        {items.map((item, index) => {
          const angle = (index * 30 - 90) * (Math.PI / 180);
          const radius = 100;
          const x = Math.cos(angle) * radius + 128;
          const y = Math.sin(angle) * radius + 128;
          
          const isSelected = mode === "hours" ? item === hours : item === minutes;
          
          return (
            <button
              key={item}
              type="button"
              onClick={() => mode === "hours" ? handleHourClick(item) : handleMinuteClick(item)}
              className={cn(
                "absolute w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all",
                isSelected 
                  ? "bg-primary text-primary-foreground scale-110" 
                  : "hover:bg-primary/20 text-foreground"
              )}
              style={{
                left: `${x - 20}px`,
                top: `${y - 20}px`,
              }}
            >
              {item}
            </button>
          );
        })}
        
        {/* Clock hand */}
        {(() => {
          const currentValue = mode === "hours" ? hours : minutes / 5;
          const angle = (currentValue * 30 - 90) * (Math.PI / 180);
          const handLength = 90;
          
          return (
            <div
              className="absolute top-1/2 left-1/2 w-0.5 bg-primary origin-left transition-transform duration-200"
              style={{
                height: "2px",
                width: `${handLength}px`,
                transform: `translate(-50%, -50%) rotate(${(currentValue * 30)}deg)`,
                transformOrigin: "0 50%",
              }}
            />
          );
        })()}
      </div>
    );
  };

  const displayValue = value || "Select time";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("justify-start text-left font-normal h-11", !value && "text-muted-foreground", className)}
        >
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-6 bg-background z-50" align="start">
        <div className="space-y-4">
          {/* Time Display */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => setMode("hours")}
              className={cn(
                "text-4xl font-bold transition-colors",
                mode === "hours" ? "text-primary" : "text-muted-foreground"
              )}
            >
              {hours}
            </button>
            <span className="text-4xl font-bold">:</span>
            <button
              type="button"
              onClick={() => setMode("minutes")}
              className={cn(
                "text-4xl font-bold transition-colors",
                mode === "minutes" ? "text-primary" : "text-muted-foreground"
              )}
            >
              {minutes.toString().padStart(2, "0")}
            </button>
            <div className="flex flex-col gap-1 ml-2">
              <button
                type="button"
                onClick={() => setPeriod("AM")}
                className={cn(
                  "text-sm font-medium px-2 py-1 rounded transition-colors",
                  period === "AM" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                )}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setPeriod("PM")}
                className={cn(
                  "text-sm font-medium px-2 py-1 rounded transition-colors",
                  period === "PM" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                )}
              >
                PM
              </button>
            </div>
          </div>

          {/* Clock Face */}
          {renderClockFace()}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleDone}>
              OK
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
