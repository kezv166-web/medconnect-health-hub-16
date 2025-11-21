import { useState } from "react";
import { Users, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
}

const initialMembers: FamilyMember[] = [
  { id: "1", name: "John Doe", relation: "Self" },
  { id: "2", name: "Jane Doe", relation: "Spouse" },
];

const FamilyMemberSelector = () => {
  const [members, setMembers] = useState<FamilyMember[]>(initialMembers);
  const [selectedMember, setSelectedMember] = useState<FamilyMember>(members[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const [newMember, setNewMember] = useState({
    name: "",
    relation: "",
  });

  const handleAddMember = () => {
    if (!newMember.name || !newMember.relation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const member: FamilyMember = {
      id: Date.now().toString(),
      ...newMember,
    };

    setMembers([...members, member]);
    setNewMember({ name: "", relation: "" });
    setIsDialogOpen(false);

    toast({
      title: "Family Member Added",
      description: `${member.name} has been added to your family members`,
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Family Member Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[200px] justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{selectedMember.name}</span>
            </div>
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Select Profile</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {members.map((member) => (
            <DropdownMenuItem
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className={selectedMember.id === member.id ? "bg-primary/10" : ""}
            >
              <div className="flex flex-col">
                <span className="font-medium">{member.name}</span>
                <span className="text-xs text-muted-foreground">{member.relation}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Family Member Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Family Member</DialogTitle>
            <DialogDescription>
              Add a family member to manage their medications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-name">Full Name</Label>
              <Input
                id="member-name"
                placeholder="e.g., Jane Doe"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relation">Relation</Label>
              <Input
                id="relation"
                placeholder="e.g., Mother, Father, Child"
                value={newMember.relation}
                onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAddMember} className="flex-1">
              Add Member
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
    </div>
  );
};

export default FamilyMemberSelector;
