import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Plus, Trash2, Save, User, Stethoscope, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const medicineSchema = z.object({
  id: z.string().optional(),
  medicine_name: z.string().min(2, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  timings: z.string().min(1, "Timing is required"),
  duration_days: z.number().min(1, "Duration must be at least 1 day"),
  quantity_remaining: z.number().min(0, "Quantity cannot be negative"),
});

const profileSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(1, "Age must be at least 1").max(120, "Age must be less than 120"),
  primary_health_condition: z.string().min(2, "Please specify your primary health condition"),
  doctor_name: z.string().min(2, "Doctor name is required"),
  specialty: z.string().min(2, "Specialty is required"),
  hospital_clinic_name: z.string().min(2, "Hospital/Clinic name is required"),
  clinic_address: z.string().min(5, "Clinic address is required"),
  clinic_contact_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  last_consultation_date: z.date({ required_error: "Last consultation date is required" }),
  next_follow_up_date: z.date({ required_error: "Next follow-up date is required" }),
  medicines: z.array(medicineSchema).min(1, "Add at least one medicine"),
});

type FormData = z.infer<typeof profileSchema>;

const UpdateProfileForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileId, setProfileId] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      email: "",
      age: 0,
      primary_health_condition: "",
      doctor_name: "",
      specialty: "",
      hospital_clinic_name: "",
      clinic_address: "",
      clinic_contact_number: "",
      medicines: [],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medicines",
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch patient profile
      const { data: profile } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setProfileId(profile.id);
        form.reset({
          full_name: profile.full_name,
          phone_number: profile.phone_number,
          email: profile.email,
          age: profile.age,
          primary_health_condition: profile.primary_health_condition,
          doctor_name: profile.doctor_name,
          specialty: profile.specialty,
          hospital_clinic_name: profile.hospital_clinic_name,
          clinic_address: profile.clinic_address,
          clinic_contact_number: profile.clinic_contact_number,
          last_consultation_date: parseISO(profile.last_consultation_date),
          next_follow_up_date: parseISO(profile.next_follow_up_date),
          medicines: [],
        });

        // Fetch medicines
        const { data: medicines } = await supabase
          .from('medicines')
          .select('*')
          .eq('patient_id', profile.id);

        if (medicines && medicines.length > 0) {
          form.setValue('medicines', medicines.map(med => ({
            id: med.id,
            medicine_name: med.medicine_name,
            dosage: med.dosage,
            frequency: med.frequency,
            timings: med.timings,
            duration_days: med.duration_days,
            quantity_remaining: med.quantity_remaining,
          })));
        }
      }
    };

    fetchProfileData();
  }, [form]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Update patient profile
      const { error: profileError } = await supabase
        .from('patient_profiles')
        .update({
          full_name: data.full_name,
          phone_number: data.phone_number,
          age: data.age,
          primary_health_condition: data.primary_health_condition,
          doctor_name: data.doctor_name,
          specialty: data.specialty,
          hospital_clinic_name: data.hospital_clinic_name,
          clinic_address: data.clinic_address,
          clinic_contact_number: data.clinic_contact_number,
          last_consultation_date: format(data.last_consultation_date, "yyyy-MM-dd"),
          next_follow_up_date: format(data.next_follow_up_date, "yyyy-MM-dd"),
        })
        .eq('id', profileId);

      if (profileError) throw profileError;

      // Delete existing medicines and insert new ones
      const { error: deleteError } = await supabase
        .from('medicines')
        .delete()
        .eq('patient_id', profileId);

      if (deleteError) throw deleteError;

      // Insert updated medicines
      const medicinesData = data.medicines.map((med) => ({
        patient_id: profileId,
        medicine_name: med.medicine_name,
        dosage: med.dosage,
        frequency: med.frequency,
        timings: med.timings,
        duration_days: med.duration_days,
        quantity_remaining: med.quantity_remaining,
      }));

      const { error: medicinesError } = await supabase
        .from('medicines')
        .insert(medicinesData);

      if (medicinesError) throw medicinesError;

      toast({
        title: "Success!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Update Your Profile</h1>
        <p className="text-muted-foreground">
          Update your personal information, doctor details, and medications
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Health Details
            </CardTitle>
            <CardDescription>Your basic information and health condition</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  {...form.register("full_name")}
                  placeholder="John Doe"
                />
                {form.formState.errors.full_name && (
                  <p className="text-sm text-destructive">{form.formState.errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input
                  id="phone_number"
                  {...form.register("phone_number")}
                  placeholder="+1234567890"
                />
                {form.formState.errors.phone_number && (
                  <p className="text-sm text-destructive">{form.formState.errors.phone_number.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  {...form.register("age", { valueAsNumber: true })}
                  placeholder="30"
                />
                {form.formState.errors.age && (
                  <p className="text-sm text-destructive">{form.formState.errors.age.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="primary_health_condition">Primary Health Condition *</Label>
                <Input
                  id="primary_health_condition"
                  {...form.register("primary_health_condition")}
                  placeholder="e.g., Diabetes, Hypertension"
                />
                {form.formState.errors.primary_health_condition && (
                  <p className="text-sm text-destructive">{form.formState.errors.primary_health_condition.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctor & Clinic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-success" />
              Doctor & Clinic Information
            </CardTitle>
            <CardDescription>Your primary care physician details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor_name">Doctor's Name *</Label>
                <Input
                  id="doctor_name"
                  {...form.register("doctor_name")}
                  placeholder="Dr. Smith"
                />
                {form.formState.errors.doctor_name && (
                  <p className="text-sm text-destructive">{form.formState.errors.doctor_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty *</Label>
                <Input
                  id="specialty"
                  {...form.register("specialty")}
                  placeholder="Cardiologist"
                />
                {form.formState.errors.specialty && (
                  <p className="text-sm text-destructive">{form.formState.errors.specialty.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="hospital_clinic_name">Hospital/Clinic Name *</Label>
                <Input
                  id="hospital_clinic_name"
                  {...form.register("hospital_clinic_name")}
                  placeholder="City General Hospital"
                />
                {form.formState.errors.hospital_clinic_name && (
                  <p className="text-sm text-destructive">{form.formState.errors.hospital_clinic_name.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="clinic_address">Clinic Address *</Label>
                <Input
                  id="clinic_address"
                  {...form.register("clinic_address")}
                  placeholder="123 Medical Street"
                />
                {form.formState.errors.clinic_address && (
                  <p className="text-sm text-destructive">{form.formState.errors.clinic_address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic_contact_number">Clinic Contact Number *</Label>
                <Input
                  id="clinic_contact_number"
                  {...form.register("clinic_contact_number")}
                  placeholder="+1234567890"
                />
                {form.formState.errors.clinic_contact_number && (
                  <p className="text-sm text-destructive">{form.formState.errors.clinic_contact_number.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Last Consultation Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch("last_consultation_date") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("last_consultation_date") ? (
                        format(form.watch("last_consultation_date"), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.watch("last_consultation_date")}
                      onSelect={(date) => date && form.setValue("last_consultation_date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.last_consultation_date && (
                  <p className="text-sm text-destructive">{form.formState.errors.last_consultation_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Next Follow-up Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch("next_follow_up_date") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("next_follow_up_date") ? (
                        format(form.watch("next_follow_up_date"), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.watch("next_follow_up_date")}
                      onSelect={(date) => date && form.setValue("next_follow_up_date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.next_follow_up_date && (
                  <p className="text-sm text-destructive">{form.formState.errors.next_follow_up_date.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Medication Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              Current Medication Inventory
            </CardTitle>
            <CardDescription>List all medications you are currently taking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border border-border rounded-lg space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-foreground">Medicine {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Medicine Name *</Label>
                    <Input
                      {...form.register(`medicines.${index}.medicine_name`)}
                      placeholder="e.g., Aspirin"
                    />
                    {form.formState.errors.medicines?.[index]?.medicine_name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.medicines[index]?.medicine_name?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Dosage *</Label>
                    <Input
                      {...form.register(`medicines.${index}.dosage`)}
                      placeholder="e.g., 100mg"
                    />
                    {form.formState.errors.medicines?.[index]?.dosage && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.medicines[index]?.dosage?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Frequency *</Label>
                    <Select
                      value={form.watch(`medicines.${index}.frequency`)}
                      onValueChange={(value) => form.setValue(`medicines.${index}.frequency`, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Once daily">Once daily</SelectItem>
                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                        <SelectItem value="Three times daily">Three times daily</SelectItem>
                        <SelectItem value="Four times daily">Four times daily</SelectItem>
                        <SelectItem value="As needed">As needed</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.medicines?.[index]?.frequency && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.medicines[index]?.frequency?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Timing *</Label>
                    <Select
                      value={form.watch(`medicines.${index}.timings`)}
                      onValueChange={(value) => form.setValue(`medicines.${index}.timings`, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Before Food">Before Food</SelectItem>
                        <SelectItem value="After Food">After Food</SelectItem>
                        <SelectItem value="With Food">With Food</SelectItem>
                        <SelectItem value="Empty Stomach">Empty Stomach</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.medicines?.[index]?.timings && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.medicines[index]?.timings?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (days) *</Label>
                    <Input
                      type="number"
                      {...form.register(`medicines.${index}.duration_days`, { valueAsNumber: true })}
                      placeholder="30"
                    />
                    {form.formState.errors.medicines?.[index]?.duration_days && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.medicines[index]?.duration_days?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity Remaining *</Label>
                    <Input
                      type="number"
                      {...form.register(`medicines.${index}.quantity_remaining`, { valueAsNumber: true })}
                      placeholder="20"
                    />
                    {form.formState.errors.medicines?.[index]?.quantity_remaining && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.medicines[index]?.quantity_remaining?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() =>
                append({
                  medicine_name: "",
                  dosage: "",
                  frequency: "Once daily",
                  timings: "After Food",
                  duration_days: 30,
                  quantity_remaining: 0,
                })
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Medicine
            </Button>

            {form.formState.errors.medicines && (
              <p className="text-sm text-destructive">
                {form.formState.errors.medicines.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfileForm;
