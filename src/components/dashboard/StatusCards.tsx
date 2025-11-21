import { Clock, Pill, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const statusData = [
  {
    icon: Clock,
    label: "Next Dose Due",
    value: "2:00 PM",
    subtitle: "Metformin 500mg",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Pill,
    label: "Medicines Remaining",
    value: "12",
    subtitle: "3 need refill soon",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Calendar,
    label: "Upcoming Appointment",
    value: "Dec 24",
    subtitle: "Dr. Sarah Johnson",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
];

const StatusCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statusData.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.label}
            className="border-border hover:shadow-md transition-all duration-200 animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${item.bgColor}`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                  <p className="text-2xl font-bold text-foreground mb-1">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatusCards;
