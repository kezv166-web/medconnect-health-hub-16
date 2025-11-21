import { MapPin, Phone, Droplet, Bed, Pill, Building2, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Facility } from "@/pages/NearbyServices";

interface FacilityCardProps {
  facility: Facility;
  index: number;
}

const FacilityCard = ({ facility, index }: FacilityCardProps) => {
  const oxygenAvailable = facility.resources.oxygenCylinders.available > 0;
  const oxygenPercentage =
    (facility.resources.oxygenCylinders.available / facility.resources.oxygenCylinders.total) * 100;
  
  const icuAvailable = facility.resources.icuBeds.available > 0;
  const icuPercentage =
    (facility.resources.icuBeds.available / facility.resources.icuBeds.total) * 100;

  const getAvailabilityColor = (percentage: number) => {
    if (percentage === 0) return "text-destructive";
    if (percentage < 30) return "text-destructive";
    if (percentage < 60) return "text-yellow-600";
    return "text-success";
  };

  const getAvailabilityBg = (percentage: number) => {
    if (percentage === 0) return "bg-destructive/10";
    if (percentage < 30) return "bg-destructive/10";
    if (percentage < 60) return "bg-yellow-600/10";
    return "bg-success/10";
  };

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 animate-scale-in border-l-4"
      style={{
        animationDelay: `${index * 50}ms`,
        borderLeftColor:
          facility.type === "hospital"
            ? "hsl(var(--destructive))"
            : "hsl(var(--primary))",
      }}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg mt-1">
                {facility.type === "hospital" ? (
                  <Building2 className="w-5 h-5 text-primary" />
                ) : (
                  <Stethoscope className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {facility.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{facility.distance} km away</span>
                </div>
              </div>
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-2 mb-3">
              {facility.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          {/* Contact */}
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <Phone className="w-4 h-4 mr-2" />
            Call Now
          </Button>
        </div>

        {/* Critical Resources Section */}
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Real-Time Availability
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Oxygen Cylinders */}
            <div
              className={`p-3 rounded-lg border ${
                oxygenAvailable ? "border-success/20" : "border-destructive/20"
              } ${getAvailabilityBg(oxygenPercentage)}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    oxygenAvailable ? "bg-success" : "bg-destructive"
                  }`}
                />
                <Droplet className={`w-4 h-4 ${getAvailabilityColor(oxygenPercentage)}`} />
                <span className="text-xs font-medium text-foreground">Oxygen</span>
              </div>
              <p className={`text-sm font-bold ${getAvailabilityColor(oxygenPercentage)}`}>
                {facility.resources.oxygenCylinders.available > 0
                  ? `${facility.resources.oxygenCylinders.available} Available`
                  : "Out of Stock"}
              </p>
              <p className="text-xs text-muted-foreground">
                of {facility.resources.oxygenCylinders.total} total
              </p>
            </div>

            {/* ICU Beds */}
            {facility.resources.icuBeds.total > 0 && (
              <div
                className={`p-3 rounded-lg border ${
                  icuAvailable ? "border-success/20" : "border-destructive/20"
                } ${getAvailabilityBg(icuPercentage)}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      icuAvailable ? "bg-success" : "bg-destructive"
                    }`}
                  />
                  <Bed className={`w-4 h-4 ${getAvailabilityColor(icuPercentage)}`} />
                  <span className="text-xs font-medium text-foreground">ICU Beds</span>
                </div>
                <p className={`text-sm font-bold ${getAvailabilityColor(icuPercentage)}`}>
                  {facility.resources.icuBeds.available > 0
                    ? `${facility.resources.icuBeds.available} Beds`
                    : "Full"}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {facility.resources.icuBeds.total} total
                </p>
              </div>
            )}

            {/* Blood Bank */}
            {facility.resources.bloodBank.length > 0 && (
              <div className="p-3 rounded-lg border border-success/20 bg-success/10">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <Droplet className="w-4 h-4 text-success" />
                  <span className="text-xs font-medium text-foreground">Blood Bank</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {facility.resources.bloodBank.map((type) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className="text-xs border-success text-success"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Pharmacy */}
            <div
              className={`p-3 rounded-lg border ${
                facility.resources.pharmacyOpen
                  ? "border-success/20 bg-success/10"
                  : "border-destructive/20 bg-destructive/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    facility.resources.pharmacyOpen ? "bg-success" : "bg-destructive"
                  }`}
                />
                <Pill
                  className={`w-4 h-4 ${
                    facility.resources.pharmacyOpen ? "text-success" : "text-destructive"
                  }`}
                />
                <span className="text-xs font-medium text-foreground">Pharmacy</span>
              </div>
              <p
                className={`text-sm font-bold ${
                  facility.resources.pharmacyOpen ? "text-success" : "text-destructive"
                }`}
              >
                {facility.resources.pharmacyOpen ? "Open" : "Closed"}
              </p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">{facility.contact.address}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FacilityCard;
