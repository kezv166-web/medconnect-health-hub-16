import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";

interface AdherenceData {
  date: string;
  adherence: number;
  taken: number;
  total: number;
}

export default function AdherenceAreaChart() {
  const [data, setData] = useState<AdherenceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdherenceData();
    
    // Set up real-time subscription for intake_logs changes
    const channel = supabase
      .channel('adherence-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'intake_logs'
        },
        () => {
          fetchAdherenceData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAdherenceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) return;

      // Get last 7 days of data
      const days = 7;
      const adherenceData: AdherenceData[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = format(subDays(new Date(), i), "yyyy-MM-dd");
        const dayLabel = format(subDays(new Date(), i), "EEE");

        // Get total schedules for that day (all schedules in database)
        const { data: schedules } = await supabase
          .from("medicine_schedules")
          .select("id")
          .eq("patient_id", profile.id);

        const totalSchedules = schedules?.length || 0;

        // Get taken medicines for that day
        const { data: logs } = await supabase
          .from("intake_logs")
          .select("schedule_id")
          .eq("log_date", date)
          .eq("status", "taken");

        const takenCount = logs?.length || 0;

        // Calculate adherence percentage
        const adherence = totalSchedules > 0 ? Math.round((takenCount / totalSchedules) * 100) : 0;

        adherenceData.push({
          date: dayLabel,
          adherence,
          taken: takenCount,
          total: totalSchedules,
        });
      }

      setData(adherenceData);
    } catch (error) {
      console.error("Error fetching adherence data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">7-Day Adherence Trend</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">7-Day Adherence Trend</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Your medication intake consistency over the past week
      </p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-sm">
                    <div className="font-semibold">{data.adherence}% Adherence</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {data.taken} of {data.total} taken
                    </div>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="adherence"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAdherence)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {data.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {Math.round(data.reduce((acc, d) => acc + d.adherence, 0) / data.length)}%
            </p>
            <p className="text-xs text-muted-foreground">Avg. Adherence</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {data.reduce((acc, d) => acc + d.taken, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Doses Taken</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-muted-foreground">
              {data.reduce((acc, d) => acc + (d.total - d.taken), 0)}
            </p>
            <p className="text-xs text-muted-foreground">Doses Missed</p>
          </div>
        </div>
      )}
    </Card>
  );
}
