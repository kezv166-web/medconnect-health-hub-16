import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Clock, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ClinicRegistration = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [clinicData, setClinicData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    specialties: "",
    hours: "",
    description: "",
  });

  useEffect(() => {
    fetchHospitalProfile();
  }, []);

  const fetchHospitalProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('hospital_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching hospital profile:', error);
      return;
    }

    if (data) {
      setHasProfile(true);
      setClinicData({
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: '',
        specialties: data.specialties?.join(', ') || '',
        hours: data.operating_hours,
        description: data.description || '',
      });
    } else {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!clinicData.name || !clinicData.address || !clinicData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const specialtiesArray = clinicData.specialties
      .split(',')
      .map(s => s.trim())
      .filter(s => s);

    const { error } = await supabase
      .from('hospital_profiles')
      .upsert({
        user_id: user.id,
        name: clinicData.name,
        address: clinicData.address,
        phone: clinicData.phone,
        operating_hours: clinicData.hours,
        specialties: specialtiesArray,
        description: clinicData.description,
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setHasProfile(true);
    setIsEditing(false);
    toast({
      title: hasProfile ? "Clinic Updated" : "Clinic Registered",
      description: hasProfile 
        ? "Your clinic information has been updated successfully"
        : "Your clinic has been registered successfully and is now visible in the nearby services",
    });
  };

  // Show profile view if profile exists and not editing
  if (hasProfile && !isEditing) {
    return (
      <div className="space-y-6">
        {/* Clinic Profile Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Clinic Profile</h2>
            <p className="text-muted-foreground mt-1">Your clinic information</p>
          </div>
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Clinic Profile Card */}
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

        {/* Detailed Information */}
        <Card>
          <CardHeader>
            <CardTitle>Clinic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-muted-foreground">Clinic Name</Label>
                <p className="text-foreground font-medium mt-1">{clinicData.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone Number</Label>
                <p className="text-foreground font-medium mt-1">{clinicData.phone}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">Address</Label>
                <p className="text-foreground font-medium mt-1">{clinicData.address}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Specialties</Label>
                <p className="text-foreground font-medium mt-1">{clinicData.specialties || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Operating Hours</Label>
                <p className="text-foreground font-medium mt-1">{clinicData.hours}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-foreground font-medium mt-1">{clinicData.description || 'No description provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show registration/edit form
  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">
          {hasProfile ? 'Edit Clinic Profile' : 'Register Your Clinic'}
        </h2>
        <p className="text-muted-foreground mt-1">
          {hasProfile ? 'Update your clinic information' : 'Complete your clinic registration to get started'}
        </p>
      </div>

      {/* Clinic Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>{hasProfile ? 'Update' : 'Enter'} Clinic Information</CardTitle>
          <CardDescription>
            {hasProfile ? 'Update your clinic details and practice information' : 'Fill in your clinic details to complete registration'}
          </CardDescription>
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            {hasProfile && (
              <Button onClick={() => setIsEditing(false)} variant="outline" size="lg" disabled={loading}>
                Cancel
              </Button>
            )}
            <Button onClick={handleSave} size="lg" className="min-w-[200px] bg-success hover:bg-success/90" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : hasProfile ? "Save Changes" : "Register Clinic"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicRegistration;
