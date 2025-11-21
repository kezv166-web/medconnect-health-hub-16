import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MedicineSetupForm from "@/components/medicine/MedicineSetupForm";
import MedicineList from "@/components/medicine/MedicineList";
import FamilyMemberSelector from "@/components/medicine/FamilyMemberSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Medicine {
  id: string;
  medicine_name: string;
  dosage: string;
  time_slot: string;
  instruction: string;
}

const MedicineManagement = () => {
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [patientId, setPatientId] = useState<string>("");

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profile) {
      setPatientId(profile.id);

      const { data: schedulesData } = await supabase
        .from('medicine_schedules')
        .select('*')
        .eq('patient_id', profile.id);

      if (schedulesData) {
        const formattedMedicines = schedulesData.map(med => ({
          id: med.id,
          medicine_name: med.medicine_name,
          dosage: med.dosage,
          time_slot: med.time_slot,
          instruction: med.instruction,
        }));
        setMedicines(formattedMedicines);
      }
    }
  };

  const handleMedicineAdded = () => {
    fetchMedicines();
    setShowAddForm(false);
  };

  const handleDeleteMedicine = async (id: string) => {
    const { error } = await supabase
      .from('medicine_schedules')
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

  const handleCancelForm = () => {
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Medicine Inventory</h1>
        <p className="text-muted-foreground">Manage your medication inventory</p>
      </div>

      <div className="space-y-6">
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

        {/* Add Medicine Form */}
        {showAddForm && (
          <Card className="border-primary/20 animate-scale-in">
            <CardHeader>
              <CardTitle>Add New Medicine</CardTitle>
              <CardDescription>
                Fill in the details to add a new medicine schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MedicineSetupForm
                onSuccess={handleMedicineAdded}
                onCancel={handleCancelForm}
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
            onDelete={handleDeleteMedicine}
          />
        </div>
      </div>
    </div>
  );
};

export default MedicineManagement;
