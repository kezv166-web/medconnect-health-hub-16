import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Medicine } from "@/pages/MedicineManagement";

interface AddMedicineFormProps {
  onSubmit: (medicine: Omit<Medicine, "id"> | Medicine) => void;
  onCancel: () => void;
  initialData?: Medicine;
}

const AddMedicineForm = ({ onSubmit, onCancel, initialData }: AddMedicineFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    dosage: initialData?.dosage || "",
    frequency: initialData?.frequency || 1,
    daysToIntake: initialData?.daysToIntake || 7,
    doctorName: initialData?.doctorName || "",
    startDate: initialData?.startDate || new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.dosage || !formData.doctorName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.frequency < 1 || formData.daysToIntake < 1) {
      toast({
        title: "Invalid Values",
        description: "Frequency and days must be positive numbers",
        variant: "destructive",
      });
      return;
    }

    const medicineData = initialData
      ? { ...formData, id: initialData.id }
      : formData;

    onSubmit(medicineData);

    toast({
      title: initialData ? "Medicine Updated" : "Medicine Added",
      description: `${formData.name} has been ${initialData ? "updated" : "added"} successfully`,
    });

    if (!initialData) {
      setFormData({
        name: "",
        dosage: "",
        frequency: 1,
        daysToIntake: 7,
        doctorName: "",
        startDate: new Date().toISOString().split("T")[0],
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Medicine Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Medicine Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g., Metformin"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* Dosage */}
        <div className="space-y-2">
          <Label htmlFor="dosage">
            Dosage (mg) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="dosage"
            placeholder="e.g., 500mg"
            value={formData.dosage}
            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            required
          />
        </div>

        {/* Frequency */}
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency (times per day)</Label>
          <Input
            id="frequency"
            type="number"
            min="1"
            max="10"
            value={formData.frequency}
            onChange={(e) =>
              setFormData({ ...formData, frequency: parseInt(e.target.value) || 1 })
            }
          />
        </div>

        {/* Days to Intake */}
        <div className="space-y-2">
          <Label htmlFor="days">Days to Intake</Label>
          <Input
            id="days"
            type="number"
            min="1"
            max="365"
            value={formData.daysToIntake}
            onChange={(e) =>
              setFormData({ ...formData, daysToIntake: parseInt(e.target.value) || 7 })
            }
          />
        </div>

        {/* Doctor Name */}
        <div className="space-y-2">
          <Label htmlFor="doctor">
            Doctor's Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="doctor"
            placeholder="Dr. Sarah Johnson"
            value={formData.doctorName}
            onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
            required
          />
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {initialData ? "Update Medicine" : "Add Medicine"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AddMedicineForm;
