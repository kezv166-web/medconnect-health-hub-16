import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Clock, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ClinicRegistration = () => {
  const { toast } = useToast();
  const [clinicData, setClinicData] = useState({
    name: "Johnson Medical Clinic",
    address: "123 Healthcare Avenue, Medical District",
    phone: "+1 (555) 234-5678",
    email: "info@johnsonmedical.com",
    specialties: "Cardiology, Internal Medicine",
    hours: "Mon-Fri: 9:00 AM - 5:00 PM",
    description: "Providing comprehensive cardiac and internal medicine care with state-of-the-art facilities.",
    licenseNumber: "MED-2024-12345",
  });

  const handleSave = () => {
    if (!clinicData.name || !clinicData.address || !clinicData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Clinic Updated",
      description: "Your clinic information has been saved successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Clinic Status */}
      <Card className="border-success/20 bg-success/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-success/10 rounded-xl">
              <Building2 className="w-6 h-6 text-success" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-foreground">{clinicData.name}</h3>
                <Badge variant="default" className="bg-success">
                  Active
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{clinicData.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{clinicData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{clinicData.hours}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinic Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Clinic Information</CardTitle>
          <CardDescription>Update your clinic details and practice information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinic-name">
                Clinic Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="clinic-name"
                value={clinicData.name}
                onChange={(e) => setClinicData({ ...clinicData, name: e.target.value })}
                placeholder="Johnson Medical Clinic"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license">Medical License Number</Label>
              <Input
                id="license"
                value={clinicData.licenseNumber}
                onChange={(e) => setClinicData({ ...clinicData, licenseNumber: e.target.value })}
                placeholder="MED-2024-12345"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={clinicData.phone}
                onChange={(e) => setClinicData({ ...clinicData, phone: e.target.value })}
                placeholder="+1 (555) 234-5678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={clinicData.email}
                onChange={(e) => setClinicData({ ...clinicData, email: e.target.value })}
                placeholder="info@clinic.com"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">
                Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address"
                value={clinicData.address}
                onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })}
                placeholder="123 Healthcare Avenue, Medical District"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties</Label>
              <Input
                id="specialties"
                value={clinicData.specialties}
                onChange={(e) => setClinicData({ ...clinicData, specialties: e.target.value })}
                placeholder="Cardiology, Internal Medicine (comma separated)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours">Operating Hours</Label>
              <Input
                id="hours"
                value={clinicData.hours}
                onChange={(e) => setClinicData({ ...clinicData, hours: e.target.value })}
                placeholder="Mon-Fri: 9:00 AM - 5:00 PM"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Clinic Description</Label>
              <Textarea
                id="description"
                value={clinicData.description}
                onChange={(e) => setClinicData({ ...clinicData, description: e.target.value })}
                placeholder="Describe your clinic, services, and facilities..."
                rows={4}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-border">
            <Button onClick={handleSave} size="lg" className="min-w-[200px]">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicRegistration;
