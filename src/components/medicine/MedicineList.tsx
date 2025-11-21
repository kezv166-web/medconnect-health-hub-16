import { Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Medicine } from "@/pages/MedicineManagement";

interface MedicineListProps {
  medicines: Medicine[];
  onDelete: (id: string) => void;
}

const MedicineList = ({ medicines, onDelete }: MedicineListProps) => {
  if (medicines.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No medicines added yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Click "Add New Medicine" to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {medicines.map((medicine, index) => (
        <Card
          key={medicine.id}
          className="hover:shadow-md transition-all duration-200 animate-scale-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Medicine Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {medicine.medicine_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Dosage: <span className="font-medium text-foreground">{medicine.dosage}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground capitalize">
                      {medicine.time_slot}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md capitalize">
                      {medicine.instruction.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex lg:flex-col gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1 lg:flex-initial"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {medicine.medicine_name}? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(medicine.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MedicineList;
