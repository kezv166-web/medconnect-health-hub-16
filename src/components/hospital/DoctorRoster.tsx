import { useState } from "react";
import { Plus, Edit, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Doctor {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  experience: string;
  phone: string;
}

const initialDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialties: ["Cardiology", "Internal Medicine"],
    rating: 4.8,
    experience: "15 years",
    phone: "+1 (555) 234-5678",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialties: ["Neurology", "Emergency Care"],
    rating: 4.9,
    experience: "12 years",
    phone: "+1 (555) 345-6789",
  },
];

const DoctorRoster = () => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    specialties: "",
    rating: 4.0,
    experience: "",
    phone: "",
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.specialties || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const specialtiesArray = formData.specialties
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    if (editingDoctor) {
      setDoctors(
        doctors.map((doc) =>
          doc.id === editingDoctor.id
            ? { ...doc, ...formData, specialties: specialtiesArray }
            : doc
        )
      );
      toast({
        title: "Doctor Updated",
        description: `${formData.name}'s information has been updated`,
      });
    } else {
      const newDoctor: Doctor = {
        id: Date.now().toString(),
        ...formData,
        specialties: specialtiesArray,
      };
      setDoctors([...doctors, newDoctor]);
      toast({
        title: "Doctor Added",
        description: `${formData.name} has been added to the roster`,
      });
    }

    resetForm();
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialties: doctor.specialties.join(", "),
      rating: doctor.rating,
      experience: doctor.experience,
      phone: doctor.phone,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDoctors(doctors.filter((doc) => doc.id !== id));
    toast({
      title: "Doctor Removed",
      description: "Doctor has been removed from the roster",
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      specialties: "",
      rating: 4.0,
      experience: "",
      phone: "",
    });
    setEditingDoctor(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Add Doctor Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setEditingDoctor(null)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Doctor
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
            </DialogTitle>
            <DialogDescription>
              {editingDoctor
                ? "Update doctor information"
                : "Enter details for the new doctor"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Dr. Sarah Johnson"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialties">
                Specialties <span className="text-destructive">*</span>
              </Label>
              <Input
                id="specialties"
                placeholder="Cardiology, Neurology (comma separated)"
                value={formData.specialties}
                onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  placeholder="15 years"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSubmit} className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              {editingDoctor ? "Update Doctor" : "Add Doctor"}
            </Button>
            <Button variant="outline" onClick={resetForm} className="flex-1">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Doctor List */}
      <div className="grid grid-cols-1 gap-4">
        {doctors.map((doctor, index) => (
          <Card
            key={doctor.id}
            className="hover:shadow-md transition-all duration-200 animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Doctor Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {doctor.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{doctor.experience}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doctor.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{doctor.phone}</p>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(doctor)}
                    className="flex-1 lg:flex-initial"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 lg:flex-initial"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Doctor</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove <strong>{doctor.name}</strong> from
                          the roster? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(doctor.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
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
    </div>
  );
};

export default DoctorRoster;
