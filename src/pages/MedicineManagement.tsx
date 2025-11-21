import { useState, useEffect } from "react";
import { Plus, Calendar, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddMedicineForm from "@/components/medicine/AddMedicineForm";
import MedicineSetupForm from "@/components/medicine/MedicineSetupForm";
import MedicineList from "@/components/medicine/MedicineList";
import FamilyMemberSelector from "@/components/medicine/FamilyMemberSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: number;
  daysToIntake: number;
  doctorName: string;
  startDate: string;
}

const MedicineManagement = () => {
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [patientId, setPatientId] = useState<string>("");

  useEffect(() => {
    const fetchMedicines = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('patient_profiles')
        .select('id, doctor_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setPatientId(profile.id);

        const { data: medicinesData } = await supabase
          .from('medicines')
          .select('*')
          .eq('patient_id', profile.id);

        if (medicinesData) {
          const formattedMedicines = medicinesData.map(med => ({
            id: med.id,
            name: med.medicine_name,
            dosage: med.dosage,
            frequency: parseInt(med.frequency.split(' ')[0]) || 1,
            daysToIntake: med.duration_days,
            doctorName: profile.doctor_name,
            startDate: med.created_at.split('T')[0],
          }));
          setMedicines(formattedMedicines);
        }
      }
    };

    fetchMedicines();
  }, []);

  const handleAddMedicine = async (medicine: Omit<Medicine, "id">) => {
    const { data, error } = await supabase
      .from('medicines')
      .insert({
        patient_id: patientId,
        medicine_name: medicine.name,
        dosage: medicine.dosage,
        frequency: `${medicine.frequency} times daily`,
        timings: "As prescribed",
        duration_days: medicine.daysToIntake,
        quantity_remaining: medicine.daysToIntake * medicine.frequency,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add medicine",
        variant: "destructive",
      });
    } else if (data) {
      const newMedicine: Medicine = {
        id: data.id,
        name: data.medicine_name,
        dosage: data.dosage,
        frequency: medicine.frequency,
        daysToIntake: data.duration_days,
        doctorName: medicine.doctorName,
        startDate: data.created_at.split('T')[0],
      };
      setMedicines([...medicines, newMedicine]);
      setShowAddForm(false);
      toast({
        title: "Success",
        description: "Medicine added successfully",
      });
    }
  };

  const handleUpdateMedicine = async (updated: Medicine) => {
    const { error } = await supabase
      .from('medicines')
      .update({
        medicine_name: updated.name,
        dosage: updated.dosage,
        frequency: `${updated.frequency} times daily`,
        duration_days: updated.daysToIntake,
        quantity_remaining: updated.daysToIntake * updated.frequency,
      })
      .eq('id', updated.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update medicine",
        variant: "destructive",
      });
    } else {
      setMedicines(medicines.map((med) => (med.id === updated.id ? updated : med)));
      setEditingMedicine(null);
      setShowAddForm(false);
      toast({
        title: "Success",
        description: "Medicine updated successfully",
      });
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    const { error } = await supabase
      .from('medicines')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete medicine",
        variant: "destructive",
      });
    } else {
      setMedicines(medicines.filter((med) => med.id !== id));
      toast({
        title: "Success",
        description: "Medicine deleted successfully",
      });
    }
  };

  const handleEditClick = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setEditingMedicine(null);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Medicine Management</h1>
        <p className="text-muted-foreground">Track schedules and manage medications</p>
      </div>

      <Tabs defaultValue="schedules" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedules">
            <Calendar className="w-4 h-4 mr-2" />
            Medicine Schedules
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="w-4 h-4 mr-2" />
            Medicine Inventory
          </TabsTrigger>
        </TabsList>

        {/* Medicine Schedules Tab */}
        <TabsContent value="schedules" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Add Medicine Schedule</CardTitle>
              <CardDescription>
                Set up daily medication reminders with specific timing and instructions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MedicineSetupForm />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medicine Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <FamilyMemberSelector />
            {!showAddForm && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Medicine
              </Button>
            )}
          </div>

          {/* Add/Edit Medicine Form */}
          {showAddForm && (
            <Card className="border-primary/20 animate-scale-in">
              <CardHeader>
                <CardTitle>
                  {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
                </CardTitle>
                <CardDescription>
                  {editingMedicine
                    ? "Update the medicine details below"
                    : "Fill in the details to add a new medicine to your inventory"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddMedicineForm
                  onSubmit={editingMedicine ? handleUpdateMedicine : handleAddMedicine}
                  onCancel={handleCancelEdit}
                  initialData={editingMedicine || undefined}
                />
              </CardContent>
            </Card>
          )}

          {/* Current Medicines List */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Current Medicines ({medicines.length})
            </h2>
            <MedicineList
              medicines={medicines}
              onEdit={handleEditClick}
              onDelete={handleDeleteMedicine}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicineManagement;
