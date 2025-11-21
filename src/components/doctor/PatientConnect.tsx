import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Send, Mail, Phone, Calendar } from "lucide-react";
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
      lastVisit: "Pending",
      status: "pending",
    };

    setPatients([...patients, newPatient]);
    
    toast({
      title: "Invitation Sent",
      description: `Referral invitation sent to ${referralData.email || referralData.phone}`,
    });

    setReferralData({ name: "", email: "", phone: "" });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Invite Patient Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Refer Patient
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refer a Patient</DialogTitle>
            <DialogDescription>
              Send an invitation to connect a patient to the platform
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
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSendInvite} className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Send Invitation
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
                      <Badge
                        variant={patient.status === "active" ? "default" : "secondary"}
                        className={patient.status === "active" ? "bg-success" : ""}
                      >
                        {patient.status === "active" ? "Active" : "Pending"}
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
                        <Calendar className="w-4 h-4" />
                        <span>
                          Last Visit:{" "}
                          {patient.lastVisit === "Pending"
                            ? "Pending"
                            : new Date(patient.lastVisit).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {patient.status === "pending" && (
                      <Button variant="outline" size="sm">
                        <Send className="w-4 h-4 mr-2" />
                        Resend Invite
                      </Button>
                    )}
                    {patient.status === "active" && (
                      <Button variant="outline" size="sm">
                        View Records
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientConnect;
