import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, ArrowRight, ArrowLeft, Clock } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

// Zod validation schemas
const step1Schema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(1, "Age must be at least 1").max(120, "Age must be less than 120"),
  blood_group: z.string().optional(),
  primary_health_condition: z.string().min(2, "Please specify your primary health condition")
});
const step2Schema = z.object({
  doctor_name: z.string().min(2, "Doctor name is required"),
  specialty: z.string().min(2, "Specialty is required"),
  hospital_clinic_name: z.string().min(2, "Hospital/Clinic name is required"),
  clinic_address: z.string().min(5, "Clinic address is required"),
  clinic_contact_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  last_consultation_date: z.date({
    required_error: "Last consultation date is required"
  }),
  next_follow_up_date: z.date({
    required_error: "Next follow-up date is required"
  })
});
const medicineSchema = z.object({
  medicine_name: z.string().min(2, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  timings: z.string().min(1, "Timing is required"),
  time: z.string().min(1, "Time is required"),
  period: z.enum(["AM", "PM"]),
  duration_days: z.number().min(1, "Duration must be at least 1 day"),
  quantity_remaining: z.number().min(0, "Quantity cannot be negative")
});
const step3Schema = z.object({
  medicines: z.array(medicineSchema).min(1, "Add at least one medicine")
});
const completeSchema = step1Schema.merge(step2Schema).merge(step3Schema);
type FormData = z.infer<typeof completeSchema>;
const PatientOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const form = useForm<FormData>({
    resolver: zodResolver(completeSchema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      email: "",
      age: 0,
      blood_group: "",
      primary_health_condition: "",
      doctor_name: "",
      specialty: "",
      hospital_clinic_name: "",
      clinic_address: "",
      clinic_contact_number: "",
      last_consultation_date: undefined,
      next_follow_up_date: undefined,
      medicines: [{
        medicine_name: "",
        dosage: "",
        frequency: "Once daily",
        timings: "After Food",
        time: "",
        period: "AM",
        duration_days: 30,
        quantity_remaining: 0
      }]
    },
    mode: "onChange"
  });
  const {
    fields,
    append,
    remove
  } = useFieldArray({
    control: form.control,
    name: "medicines"
  });

  // Auto-fill email from authenticated user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user?.email) {
        form.setValue("email", user.email);
      }
    };
    getUser();
  }, [form]);
  const validateStep = async (step: number) => {
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger(["full_name", "phone_number", "email", "age", "blood_group", "primary_health_condition"]);
    } else if (step === 2) {
      isValid = await form.trigger(["doctor_name", "specialty", "hospital_clinic_name", "clinic_address", "clinic_contact_number", "last_consultation_date", "next_follow_up_date"]);
    } else if (step === 3) {
      isValid = await form.trigger(["medicines"]);
    }
    return isValid;
  };
  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Insert patient profile
      const {
        data: profileData,
        error: profileError
      } = await supabase.from("patient_profiles").insert({
        user_id: user.id,
        full_name: data.full_name,
        phone_number: data.phone_number,
        email: data.email,
        age: data.age,
        blood_group: data.blood_group || null,
        primary_health_condition: data.primary_health_condition,
        doctor_name: data.doctor_name,
        specialty: data.specialty,
        hospital_clinic_name: data.hospital_clinic_name,
        clinic_address: data.clinic_address,
        clinic_contact_number: data.clinic_contact_number,
        last_consultation_date: format(data.last_consultation_date, "yyyy-MM-dd"),
        next_follow_up_date: format(data.next_follow_up_date, "yyyy-MM-dd")
      }).select().single();
      if (profileError) throw profileError;

      // Insert medicines
      const medicinesData = data.medicines.map(med => ({
        patient_id: profileData.id,
        medicine_name: med.medicine_name,
        dosage: med.dosage,
        frequency: med.frequency,
        timings: med.timings,
        duration_days: med.duration_days,
        quantity_remaining: med.quantity_remaining
      }));
      const {
        error: medicinesError
      } = await supabase.from("medicines").insert(medicinesData);
      if (medicinesError) throw medicinesError;
      toast({
        title: "Success!",
        description: "Your profile has been created successfully."
      });
      navigate("/patient-dashboard");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const progressPercentage = currentStep / 3 * 100;
  return <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Welcome! Let's Set Up Your Profile
          </CardTitle>
          <CardDescription className="text-center">
            Complete these steps to personalize your health dashboard
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-2 text-sm text-muted-foreground">
              <span>Step {currentStep} of 3</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{
              width: `${progressPercentage}%`
            }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className={currentStep >= 1 ? "text-primary font-medium" : ""}>
                Personal Details
              </span>
              <span className={currentStep >= 2 ? "text-primary font-medium" : ""}>
                Doctor Info
              </span>
              <span className={currentStep >= 3 ? "text-primary font-medium" : ""}>
                Medications
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Personal Health Details */}
            {currentStep === 1 && <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold mb-4">Personal Health Details</h3>
                
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input id="full_name" {...form.register("full_name")} placeholder="John Doe" />
                  {form.formState.errors.full_name && <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.full_name.message}
                    </p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone_number">Phone Number *</Label>
                    <Input id="phone_number" {...form.register("phone_number")} placeholder="+1234567890" />
                    {form.formState.errors.phone_number && <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.phone_number.message}
                      </p>}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" {...form.register("email")} disabled className="bg-muted" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input id="age" type="number" {...form.register("age", {
                  valueAsNumber: true
                })} placeholder="25" />
                    {form.formState.errors.age && <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.age.message}
                      </p>}
                  </div>

                  <div>
                    <Label htmlFor="blood_group">Blood Group</Label>
                    <Select onValueChange={value => form.setValue("blood_group", value)} value={form.watch("blood_group")}>
                      <SelectTrigger id="blood_group">
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.blood_group && <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.blood_group.message}
                      </p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="primary_health_condition">Primary Health Condition *</Label>
                  <Input id="primary_health_condition" {...form.register("primary_health_condition")} placeholder="e.g., Diabetes, Hypertension, None" />
                  {form.formState.errors.primary_health_condition && <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.primary_health_condition.message}
                    </p>}
                </div>
              </div>}

            {/* Step 2: Doctor & Clinic Information */}
            {currentStep === 2 && <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold mb-4">Doctor & Clinic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doctor_name">Doctor's Name *</Label>
                    <Input id="doctor_name" {...form.register("doctor_name")} placeholder="Dr. Sarah Johnson" />
                    {form.formState.errors.doctor_name && <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.doctor_name.message}
                      </p>}
                  </div>

                  <div>
                    <Label htmlFor="specialty">Specialty *</Label>
                    <Input id="specialty" {...form.register("specialty")} placeholder="General Physician" />
                    {form.formState.errors.specialty && <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.specialty.message}
                      </p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="hospital_clinic_name">Hospital/Clinic Name *</Label>
                  <Input id="hospital_clinic_name" {...form.register("hospital_clinic_name")} placeholder="City General Hospital" />
                  {form.formState.errors.hospital_clinic_name && <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.hospital_clinic_name.message}
                    </p>}
                </div>

                <div>
                  <Label htmlFor="clinic_address">Clinic Address *</Label>
                  <Input id="clinic_address" {...form.register("clinic_address")} placeholder="123 Main Street, City, State" />
                  {form.formState.errors.clinic_address && <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.clinic_address.message}
                    </p>}
                </div>

                <div>
                  <Label htmlFor="clinic_contact_number">Clinic Contact Number *</Label>
                  <Input id="clinic_contact_number" {...form.register("clinic_contact_number")} placeholder="+1234567890" />
                  {form.formState.errors.clinic_contact_number && <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.clinic_contact_number.message}
                    </p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Last Consultation Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal transition-all duration-300 hover:bg-accent hover:border-primary/50", !form.watch("last_consultation_date") && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                          {form.watch("last_consultation_date") ? format(form.watch("last_consultation_date"), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 animate-scale-in" align="start">
                        <Calendar mode="single" selected={form.watch("last_consultation_date")} onSelect={date => form.setValue("last_consultation_date", date!)} disabled={date => date > new Date()} initialFocus className="pointer-events-auto transition-all duration-200" />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.last_consultation_date && <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.last_consultation_date.message}
                      </p>}
                  </div>

                  <div>
                    <Label>Next Follow-Up Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal transition-all duration-300 hover:bg-accent hover:border-primary/50", !form.watch("next_follow_up_date") && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                          {form.watch("next_follow_up_date") ? format(form.watch("next_follow_up_date"), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 animate-scale-in" align="start">
                        <Calendar mode="single" selected={form.watch("next_follow_up_date")} onSelect={date => form.setValue("next_follow_up_date", date!)} disabled={date => date < new Date()} initialFocus className="pointer-events-auto transition-all duration-200" />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.next_follow_up_date && <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.next_follow_up_date.message}
                      </p>}
                  </div>
                </div>
              </div>}

            {/* Step 3: Current Medication Inventory */}
            {currentStep === 3 && <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Current Medication Inventory</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({
                medicine_name: "",
                dosage: "",
                frequency: "Once daily",
                timings: "After Food",
                duration_days: 30,
                quantity_remaining: 0
              })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medicine
                  </Button>
                </div>

                <Alert>
                  <AlertDescription>
                    Add all your current medications to help track adherence and refills.
                  </AlertDescription>
                </Alert>

                {fields.map((field, index) => <Card key={field.id} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Medicine {index + 1}</h4>
                      {fields.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Medicine Name *</Label>
                        <Input {...form.register(`medicines.${index}.medicine_name`)} placeholder="Aspirin" />
                        {form.formState.errors.medicines?.[index]?.medicine_name && <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.medicines[index]?.medicine_name?.message}
                          </p>}
                      </div>

                      <div>
                        <Label>Dosage *</Label>
                        <Input {...form.register(`medicines.${index}.dosage`)} placeholder="500mg" />
                        {form.formState.errors.medicines?.[index]?.dosage && <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.medicines[index]?.dosage?.message}
                          </p>}
                      </div>

                      <div>
                        <Label>Frequency *</Label>
                        <Select value={form.watch(`medicines.${index}.frequency`)} onValueChange={value => form.setValue(`medicines.${index}.frequency`, value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Once daily">Once daily</SelectItem>
                            <SelectItem value="Twice daily">Twice daily</SelectItem>
                            <SelectItem value="Three times daily">Three times daily</SelectItem>
                            <SelectItem value="Four times daily">Four times daily</SelectItem>
                            <SelectItem value="As needed">As needed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Timings *</Label>
                        <Select value={form.watch(`medicines.${index}.timings`)} onValueChange={value => form.setValue(`medicines.${index}.timings`, value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="Before Food">Before Food</SelectItem>
                            <SelectItem value="After Food">After Food</SelectItem>
                            <SelectItem value="With Food">With Food</SelectItem>
                            <SelectItem value="Empty Stomach">Empty Stomach</SelectItem>
                            <SelectItem value="Anytime">Anytime</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`medicines.${index}.time`} className="flex items-center gap-2 text-sm font-medium">
                          <Clock className="h-4 w-4 text-primary" />
                          Time of Day *
                        </Label>
                        <div className="flex gap-3">
                          <div className="relative flex-1">
                            <Input id={`medicines.${index}.time`} {...form.register(`medicines.${index}.time`)} placeholder="09:00" type="time" className="h-11 text-base font-medium transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20" />
                          </div>
                          
                        </div>
                        {form.formState.errors.medicines?.[index]?.time && <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.medicines[index]?.time?.message}
                          </p>}
                      </div>

                      <div>
                        <Label>Duration (days) *</Label>
                        <Input type="number" {...form.register(`medicines.${index}.duration_days`, {
                    valueAsNumber: true
                  })} placeholder="30" />
                        {form.formState.errors.medicines?.[index]?.duration_days && <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.medicines[index]?.duration_days?.message}
                          </p>}
                      </div>

                      <div>
                        <Label>Quantity Remaining *</Label>
                        <Input type="number" {...form.register(`medicines.${index}.quantity_remaining`, {
                    valueAsNumber: true
                  })} placeholder="20" />
                        {form.formState.errors.medicines?.[index]?.quantity_remaining && <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.medicines[index]?.quantity_remaining?.message}
                          </p>}
                      </div>
                    </div>
                  </Card>)}

                {form.formState.errors.medicines && <p className="text-sm text-destructive">
                    {form.formState.errors.medicines.message}
                  </p>}
              </div>}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < 3 ? <Button type="button" onClick={nextStep}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button> : <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Complete Setup"}
                </Button>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>;
};
export default PatientOnboarding;