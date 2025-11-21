import { useState } from "react";
import { User, Stethoscope, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "./LoginForm";

export type UserRole = "patient" | "doctor" | "hospital" | null;

const roles = [
  {
    id: "patient" as const,
    title: "Patient Portal",
    description: "Access your medical records, book appointments, and connect with healthcare providers",
    icon: User,
    color: "text-primary",
    bgColor: "bg-primary/10 hover:bg-primary/15",
  },
  {
    id: "doctor" as const,
    title: "Doctor Portal",
    description: "Manage your patients, appointments, and medical documentation",
    icon: Stethoscope,
    color: "text-success",
    bgColor: "bg-success/10 hover:bg-success/15",
  },
  {
    id: "hospital" as const,
    title: "Hospital Authority",
    description: "Oversee facility operations, staff management, and patient care coordination",
    icon: Building2,
    color: "text-destructive",
    bgColor: "bg-destructive/10 hover:bg-destructive/15",
  },
];

const RoleSelector = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  const handleRoleSelect = (roleId: UserRole) => {
    setSelectedRole(selectedRole === roleId ? null : roleId);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Choose Your Portal
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select your role to access the features designed specifically for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-scale-in ${
                  isSelected ? "ring-2 ring-primary shadow-lg" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleRoleSelect(role.id)}
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-2xl ${role.bgColor} flex items-center justify-center mb-4 transition-colors`}>
                    <Icon className={`w-7 h-7 ${role.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold">{role.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <button
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {isSelected ? "Selected" : "Select Portal"}
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Login Dialog */}
        <LoginForm 
          role={selectedRole} 
          open={selectedRole !== null} 
          onClose={() => setSelectedRole(null)} 
        />
      </div>
    </section>
  );
};

export default RoleSelector;
