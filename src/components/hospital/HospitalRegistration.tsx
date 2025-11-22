import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Building2, MapPin, Phone, Clock, Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const HospitalRegistration = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hospitalData, setHospitalData] = useState({
    name: "",
    address: "",
    phone: "",
    operating_hours: "",
    specialties: "",
    latitude: 28.6139,
    longitude: 77.2090,
    pharmacy_open: false,
  });

  useEffect(() => {
    fetchHospitalProfile();
  }, []);

  const fetchHospitalProfile = async () => {
    setInitialLoading(true);
    
    // Use real Supabase auth only
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setInitialLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('hospital_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching hospital profile:', error);
      setInitialLoading(false);
      return;
    }

    if (data) {
      setHasProfile(true);
      setIsEditing(false);
      setHospitalData({
        name: data.name,
        address: data.address,
        phone: data.phone,
        operating_hours: data.operating_hours,
        specialties: data.specialties?.join(', ') || '',
        latitude: data.latitude || 28.6139,
        longitude: data.longitude || 77.2090,
        pharmacy_open: data.pharmacy_open || false,
      });
    } else {
      setIsEditing(true);
      setHasProfile(false);
    }
    setInitialLoading(false);
  };

  const handleSave = async () => {
    if (!hospitalData.name || !hospitalData.address || !hospitalData.phone || !hospitalData.operating_hours) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Use real Supabase auth only
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

    const specialtiesArray = hospitalData.specialties
      .split(',')
      .map(s => s.trim())
      .filter(s => s);

    // Check if a profile already exists for this user
    const { data: existingProfile } = await supabase
      .from('hospital_profiles')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let error;

    if (existingProfile) {
      // Update the latest existing profile
      ({ error } = await supabase
        .from('hospital_profiles')
        .update({
          name: hospitalData.name,
          address: hospitalData.address,
          phone: hospitalData.phone,
          operating_hours: hospitalData.operating_hours,
          specialties: specialtiesArray,
          latitude: hospitalData.latitude,
          longitude: hospitalData.longitude,
          pharmacy_open: hospitalData.pharmacy_open,
        })
        .eq('id', existingProfile.id));
    } else {
      // Create a new profile for this user
      ({ error } = await supabase
        .from('hospital_profiles')
        .insert({
          user_id: user.id,
          name: hospitalData.name,
          address: hospitalData.address,
          phone: hospitalData.phone,
          operating_hours: hospitalData.operating_hours,
          specialties: specialtiesArray,
          latitude: hospitalData.latitude,
          longitude: hospitalData.longitude,
          pharmacy_open: hospitalData.pharmacy_open,
        }));
    }

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
      title: hasProfile ? "Hospital Updated" : "Hospital Registered",
      description: hasProfile 
        ? "Your hospital information has been updated successfully"
        : "Your hospital has been registered successfully and is now visible in nearby services",
    });
  };

  // Show loading state during initial fetch
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-destructive border-r-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading hospital profile...</p>
        </div>
      </div>
    );
  }

  // Show profile view if profile exists and not editing
  if (hasProfile && !isEditing) {
    return (
      <div className="space-y-6">
        {/* Hospital Profile Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Hospital Profile</h2>
            <p className="text-muted-foreground mt-1">Your hospital information</p>
          </div>
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Hospital Profile Card */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-destructive/10 rounded-xl">
                <Building2 className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{hospitalData.name}</h3>
                  <Badge variant="default" className="bg-destructive">
                    Active
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{hospitalData.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{hospitalData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{hospitalData.operating_hours}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Hospital Name</Label>
                <p className="text-foreground font-medium mt-1">{hospitalData.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone Number</Label>
                <p className="text-foreground font-medium mt-1">{hospitalData.phone}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Address</Label>
                <p className="text-foreground font-medium mt-1">{hospitalData.address}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Operating Hours</Label>
                <p className="text-foreground font-medium mt-1">{hospitalData.operating_hours}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Services & Facilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Medical Specialties</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {hospitalData.specialties ? (
                    hospitalData.specialties.split(',').map((specialty, idx) => (
                      <Badge key={idx} variant="secondary">
                        {specialty.trim()}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-foreground font-medium">Not specified</p>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Pharmacy Status</Label>
                <p className="text-foreground font-medium mt-1">
                  {hospitalData.pharmacy_open ? "✓ Open" : "✗ Closed"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Location Coordinates</Label>
                <p className="text-foreground font-medium mt-1">
                  {hospitalData.latitude.toFixed(4)}, {hospitalData.longitude.toFixed(4)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show registration/edit form
  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">
          {hasProfile ? 'Edit Hospital Profile' : 'Register Your Hospital'}
        </h2>
        <p className="text-muted-foreground mt-1">
          {hasProfile ? 'Update your hospital information' : 'Complete your hospital registration to get started'}
        </p>
      </div>

      {/* Section 1: Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Essential hospital details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hospital-name">
                Hospital Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hospital-name"
                value={hospitalData.name}
                onChange={(e) => setHospitalData({ ...hospitalData, name: e.target.value })}
                placeholder="City General Hospital"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={hospitalData.phone}
                onChange={(e) => setHospitalData({ ...hospitalData, phone: e.target.value })}
                placeholder="+1 (555) 234-5678"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="hours">
                Operating Hours <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hours"
                value={hospitalData.operating_hours}
                onChange={(e) => setHospitalData({ ...hospitalData, operating_hours: e.target.value })}
                placeholder="24/7 or Mon-Fri: 9:00 AM - 5:00 PM"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>
            Hospital address and geographic coordinates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">
              Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              value={hospitalData.address}
              onChange={(e) => setHospitalData({ ...hospitalData, address: e.target.value })}
              placeholder="123 Healthcare Avenue, Medical District"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                value={hospitalData.latitude}
                onChange={(e) => setHospitalData({ ...hospitalData, latitude: parseFloat(e.target.value) || 0 })}
                placeholder="28.6139"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                value={hospitalData.longitude}
                onChange={(e) => setHospitalData({ ...hospitalData, longitude: parseFloat(e.target.value) || 0 })}
                placeholder="77.2090"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Used for nearby services map. Default coordinates set to Delhi, India.
          </p>
        </CardContent>
      </Card>

      {/* Section 3: Services */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Services</CardTitle>
          <CardDescription>
            Specialties and medical services offered at your hospital
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialties">Medical Specialties</Label>
            <Textarea
              id="specialties"
              value={hospitalData.specialties}
              onChange={(e) => setHospitalData({ ...hospitalData, specialties: e.target.value })}
              placeholder="Emergency Care, Cardiology, Orthopedics, Pediatrics, Neurology (comma separated)"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Enter specialties separated by commas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Facilities */}
      <Card>
        <CardHeader>
          <CardTitle>Facilities Available</CardTitle>
          <CardDescription>
            Hospital facility status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="pharmacy" className="text-base font-medium">
                Pharmacy
              </Label>
              <p className="text-sm text-muted-foreground">
                Is the pharmacy currently open?
              </p>
            </div>
            <Switch
              id="pharmacy"
              checked={hospitalData.pharmacy_open}
              onCheckedChange={(checked) => setHospitalData({ ...hospitalData, pharmacy_open: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        {hasProfile && (
          <Button onClick={() => setIsEditing(false)} variant="outline" size="lg" disabled={loading}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} size="lg" className="min-w-[200px]" disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : hasProfile ? "Save Changes" : "Register Hospital"}
        </Button>
      </div>
    </div>
  );
};

export default HospitalRegistration;
