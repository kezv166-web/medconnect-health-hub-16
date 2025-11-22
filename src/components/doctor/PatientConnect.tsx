import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Send, Mail, Phone, CalendarIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  status: "active" | "pending";
}

const initialPatients: Patient[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    lastVisit: "2024-01-15",
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 234-5678",
    lastVisit: "2024-01-20",
    status: "active",
  },
];

const PatientConnect = () => {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [referralData, setReferralData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [lastVisitDate, setLastVisitDate] = useState<Date>();
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);

  const handleSendInvite = () => {
    if (!referralData.email && !referralData.phone) {
      toast({
        title: "Missing Information",
        description: "Please provide either email or phone number",
        variant: "destructive",
      });
      return;
    }

    const newPatient: Patient = {
      id: Date.now().toString(),
      name: referralData.name || "New Patient",
      email: referralData.email,
      phone: referralData.phone,
      lastVisit: lastVisitDate ? lastVisitDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: "active",
    };

    setPatients([...patients, newPatient]);
    
    toast({
      title: "Patient Added",
      description: `${referralData.name || "Patient"} has been added successfully`,
    });

    setReferralData({ name: "", email: "", phone: "" });
    setPrescriptionFile(null);
    setLastVisitDate(undefined);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Invite Patient Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add a Patient</DialogTitle>
            <DialogDescription>
              Add patient details and prescription information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patient-name">Patient Name</Label>
              <Input
                id="patient-name"
                placeholder="John Doe"
                value={referralData.name}
                onChange={(e) => setReferralData({ ...referralData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient-email">Email Address</Label>
              <Input
                id="patient-email"
                type="email"
                placeholder="patient@example.com"
                value={referralData.email}
                onChange={(e) => setReferralData({ ...referralData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient-phone">Phone Number</Label>
              <Input
                id="patient-phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={referralData.phone}
                onChange={(e) => setReferralData({ ...referralData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient-prescription">Prescription</Label>
              <div className="border-2 border-dashed border-input rounded-md p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  id="patient-prescription"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPrescriptionFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="patient-prescription" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {prescriptionFile ? prescriptionFile.name : "Click to upload prescription image"}
                  </p>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Last Visit</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !lastVisitDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {lastVisitDate ? format(lastVisitDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={lastVisitDate}
                    onSelect={setLastVisitDate}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSendInvite} className="flex-1">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient List */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Connected Patients ({patients.length})
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {patients.map((patient, index) => (
            <Card
              key={patient.id}
              className="hover:shadow-md transition-all duration-200 animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Patient Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-semibold text-foreground">{patient.name}</h4>
                      <Badge variant="default" className="bg-success">
                        Active
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{patient.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setViewingPatient(patient)}
                    >
                      View Record
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Patient Record View Dialog */}
      <Dialog open={!!viewingPatient} onOpenChange={() => setViewingPatient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Record</DialogTitle>
            <DialogDescription>
              View patient details and prescription information
            </DialogDescription>
          </DialogHeader>
          
          {viewingPatient && (
            <div className="space-y-6 py-4">
              {/* Patient Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Patient Name</Label>
                  <p className="text-lg font-semibold">{viewingPatient.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">{viewingPatient.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Phone Number</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">{viewingPatient.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Last Visit</Label>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">
                      {new Date(viewingPatient.lastVisit).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Prescription Image */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Prescription</Label>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="w-4 h-4" />
                      <span>Prescription image will be displayed here</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1">
                  Edit Record
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setViewingPatient(null)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientConnect;
