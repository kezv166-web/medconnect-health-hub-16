import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddMedicineForm from "@/components/medicine/AddMedicineForm";
import MedicineList from "@/components/medicine/MedicineList";
import FamilyMemberSelector from "@/components/medicine/FamilyMemberSelector";

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: number;
  daysToIntake: number;
  doctorName: string;
  startDate: string;
}

const initialMedicines: Medicine[] = [
  {
    id: "1",
    name: "Metformin",
    dosage: "500mg",
    frequency: 2,
    daysToIntake: 30,
    doctorName: "Dr. Sarah Johnson",
    startDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: 1,
    daysToIntake: 90,
    doctorName: "Dr. Sarah Johnson",
    startDate: "2024-01-15",
  },
];

const MedicineManagement = () => {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const handleAddMedicine = (medicine: Omit<Medicine, "id">) => {
    const newMedicine = {
      ...medicine,
      id: Date.now().toString(),
    };
    setMedicines([...medicines, newMedicine]);
    setShowAddForm(false);
  };

  const handleUpdateMedicine = (updated: Medicine) => {
    setMedicines(medicines.map((med) => (med.id === updated.id ? updated : med)));
    setEditingMedicine(null);
  };

  const handleDeleteMedicine = (id: string) => {
    setMedicines(medicines.filter((med) => med.id !== id));
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Medicine Management</h1>
          <p className="text-muted-foreground">
            Track and manage your medications
          </p>
        </div>
        <FamilyMemberSelector />
      </div>

      {/* Add Medicine Button */}
      {!showAddForm && (
        <Button
          onClick={() => setShowAddForm(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Medicine
        </Button>
      )}

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
                : "Fill in the details to add a new medicine to your regimen"}
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
    </div>
  );
};

export default MedicineManagement;
