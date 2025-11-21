import { useState, useEffect } from "react";
import { User, Mail, Phone, AlertCircle, Stethoscope, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PrescriptionUpload from "@/components/dashboard/PrescriptionUpload";

const ProfileSettings = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileId, setProfileId] = useState<string>("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: 0,
    primaryHealthCondition: "",
    doctorName: "",
    specialty: "",
    hospitalClinicName: "",
    clinicAddress: "",
    clinicContactNumber: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setProfileId(profile.id);
        setFormData({
          fullName: profile.full_name,
          email: profile.email,
          phone: profile.phone_number,
          age: profile.age,
          primaryHealthCondition: profile.primary_health_condition,
          doctorName: profile.doctor_name,
          specialty: profile.specialty,
          hospitalClinicName: profile.hospital_clinic_name,
          clinicAddress: profile.clinic_address,
          clinicContactNumber: profile.clinic_contact_number,
        });
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    const { error } = await supabase
      .from('patient_profiles')
      .update({
        full_name: formData.fullName,
        phone_number: formData.phone,
        age: formData.age,
        primary_health_condition: formData.primaryHealthCondition,
        doctor_name: formData.doctorName,
        specialty: formData.specialty,
        hospital_clinic_name: formData.hospitalClinicName,
        clinic_address: formData.clinicAddress,
        clinic_contact_number: formData.clinicContactNumber,
      })
      .eq('id', profileId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile settings have been saved successfully",
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <User className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Personal Information
          </CardTitle>
          <CardDescription>Your basic details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="healthCondition">Primary Health Condition</Label>
              <Input
                id="healthCondition"
                value={formData.primaryHealthCondition}
                onChange={(e) => setFormData({ ...formData, primaryHealthCondition: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Linked Doctor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-success" />
            Linked Doctor & Clinic
          </CardTitle>
          <CardDescription>Your primary care physician details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doctorName">Doctor's Name</Label>
              <Input
                id="doctorName"
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Specialization</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="hospitalName">Hospital/Clinic Name</Label>
              <Input
                id="hospitalName"
                value={formData.hospitalClinicName}
                onChange={(e) => setFormData({ ...formData, hospitalClinicName: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="clinicAddress">Clinic Address</Label>
              <Input
                id="clinicAddress"
                value={formData.clinicAddress}
                onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicPhone">Clinic Contact Number</Label>
              <Input
                id="clinicPhone"
                type="tel"
                value={formData.clinicContactNumber}
                onChange={(e) => setFormData({ ...formData, clinicContactNumber: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prescription Upload */}
      <PrescriptionUpload />

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex gap-3 justify-end animate-scale-in">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
