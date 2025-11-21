import { MapPin, Navigation } from "lucide-react";

const MapPlaceholder = () => {
  return (
    <div className="w-full h-[400px] bg-gradient-to-br from-muted/50 to-muted rounded-xl border border-border overflow-hidden relative animate-scale-in">
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border border-border/30" />
          ))}
        </div>
      </div>

      {/* Map markers simulation */}
      <div className="absolute top-1/4 left-1/3 animate-pulse">
        <MapPin className="w-8 h-8 text-destructive fill-destructive/20" />
      </div>
      <div className="absolute top-1/2 left-1/2 animate-pulse" style={{ animationDelay: "0.2s" }}>
        <MapPin className="w-8 h-8 text-primary fill-primary/20" />
      </div>
      <div className="absolute top-1/3 right-1/4 animate-pulse" style={{ animationDelay: "0.4s" }}>
        <MapPin className="w-8 h-8 text-success fill-success/20" />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="bg-card/80 backdrop-blur-sm rounded-xl p-8 border border-border shadow-lg text-center max-w-md">
          <div className="mb-4 flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Navigation className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Interactive Map
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Map integration will display nearby medical facilities with real-time locations
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-destructive rounded-full" />
              <span>Hospitals</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>Clinics</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span>Pharmacies</span>
            </div>
          </div>
        </div>
      </div>

      {/* Corner indicators */}
      <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground">
        Your Location
      </div>
      <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground">
        5 km radius
      </div>
    </div>
  );
};

export default MapPlaceholder;
