import { useEffect, useState } from "react";
import { Clock, Pill, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const StatusCards = () => {
  const [statusData, setStatusData] = useState([
    {
      icon: Clock,
      label: "Next Dose Due",
      value: "--",
      subtitle: "Loading...",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Pill,
      label: "Medicines Remaining",
      value: "0",
      subtitle: "Loading...",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: Calendar,
      label: "Upcoming Appointment",
      value: "--",
      subtitle: "Loading...",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: medicines } = await supabase
        .from('medicines')
        .select('*')
        .eq('patient_id', profile?.id || '')
        .order('timings', { ascending: true });

      const totalMedicines = medicines?.length || 0;
      const needRefill = medicines?.filter(m => m.quantity_remaining < 10).length || 0;

      const nextMedicine = medicines?.[0];

      setStatusData([
        {
          icon: Clock,
          label: "Next Dose Due",
          value: nextMedicine?.timings || "--",
          subtitle: nextMedicine?.medicine_name || "No medicines scheduled",
          color: "text-primary",
          bgColor: "bg-primary/10",
        },
        {
          icon: Pill,
          label: "Medicines Remaining",
          value: totalMedicines.toString(),
          subtitle: needRefill > 0 ? `${needRefill} need refill soon` : "All stocked well",
          color: "text-success",
          bgColor: "bg-success/10",
        },
        {
          icon: Calendar,
          label: "Upcoming Appointment",
          value: profile?.next_follow_up_date ? format(new Date(profile.next_follow_up_date), "MMM dd") : "--",
          subtitle: profile?.doctor_name || "No appointment scheduled",
          color: "text-destructive",
          bgColor: "bg-destructive/10",
        },
      ]);
    };

    fetchData();
  }, []);

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
