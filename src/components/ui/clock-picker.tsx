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
      <div className="relative w-72 h-72 mx-auto">
        <div className="absolute inset-0 rounded-full bg-primary/5 border-2 border-primary/10" />
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 z-20 shadow-lg" />
        
        {/* Clock numbers */}
        {items.map((item, index) => {
          const angle = (index * 30 - 90) * (Math.PI / 180);
          const radius = 115;
          const x = Math.cos(angle) * radius + 144;
          const y = Math.sin(angle) * radius + 144;
          
          const isSelected = mode === "hours" ? item === hours : item === minutes;
          
          return (
            <button
              key={item}
              type="button"
              onClick={() => mode === "hours" ? handleHourClick(item) : handleMinuteClick(item)}
              className={cn(
                "absolute w-11 h-11 rounded-full flex items-center justify-center font-semibold transition-all duration-200 z-10",
                isSelected 
                  ? "bg-primary text-primary-foreground scale-110 shadow-lg" 
                  : "hover:bg-primary/15 text-foreground hover:scale-105"
              )}
              style={{
                left: `${x - 22}px`,
                top: `${y - 22}px`,
              }}
            >
              {item}
            </button>
          );
        })}
        
        {/* Clock hand */}
        {(() => {
          const currentValue = mode === "hours" ? hours : minutes / 5;
          const angle = ((currentValue === 12 ? 0 : currentValue) * 30 - 90) * (Math.PI / 180);
          const handLength = 100;
          const endX = Math.cos(angle) * handLength + 144;
          const endY = Math.sin(angle) * handLength + 144;
          
          return (
            <>
              {/* Hand line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
                <line
                  x1="144"
                  y1="144"
                  x2={endX}
                  y2={endY}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
              </svg>
              {/* Hand end circle */}
              <div
                className="absolute w-8 h-8 rounded-full bg-primary/20 border-2 border-primary -translate-x-1/2 -translate-y-1/2 z-15 transition-all duration-200"
                style={{
                  left: `${endX}px`,
                  top: `${endY}px`,
                }}
              />
            </>
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
      <PopoverContent className="w-auto p-0 bg-background z-50 shadow-xl border-2" align="start">
        <div className="p-6 space-y-6">
          {/* Time Display */}
          <div className="flex items-center justify-center gap-3 pb-4 border-b">
            <button
              type="button"
              onClick={() => setMode("hours")}
              className={cn(
                "text-5xl font-bold transition-all duration-200 px-3 py-2 rounded-lg min-w-[80px] text-center",
                mode === "hours" ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-accent"
              )}
            >
              {hours}
            </button>
            <span className="text-5xl font-bold text-muted-foreground">:</span>
            <button
              type="button"
              onClick={() => setMode("minutes")}
              className={cn(
                "text-5xl font-bold transition-all duration-200 px-3 py-2 rounded-lg min-w-[80px] text-center",
                mode === "minutes" ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-accent"
              )}
            >
              {minutes.toString().padStart(2, "0")}
            </button>
            <div className="flex flex-col gap-1.5 ml-2">
              <button
                type="button"
                onClick={() => setPeriod("AM")}
                className={cn(
                  "text-sm font-bold px-3 py-1.5 rounded-md transition-all duration-200 min-w-[50px]",
                  period === "AM" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-accent"
                )}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setPeriod("PM")}
                className={cn(
                  "text-sm font-bold px-3 py-1.5 rounded-md transition-all duration-200 min-w-[50px]",
                  period === "PM" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-accent"
                )}
              >
                PM
              </button>
            </div>
          </div>

          {/* Clock Face */}
          <div className="py-4">
            {renderClockFace()}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="font-medium">
              Cancel
            </Button>
            <Button type="button" onClick={handleDone} className="font-medium">
              OK
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
