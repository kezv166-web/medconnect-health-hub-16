import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const mockData = [
  { day: "Mon", taken: 3, missed: 0 },
  { day: "Tue", taken: 2, missed: 1 },
  { day: "Wed", taken: 3, missed: 0 },
  { day: "Thu", taken: 3, missed: 0 },
  { day: "Fri", taken: 2, missed: 1 },
  { day: "Sat", taken: 3, missed: 0 },
  { day: "Sun", taken: 3, missed: 0 },
];

const AdherenceGraph = () => {
  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Daily Intake Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar 
              dataKey="taken" 
              fill="hsl(var(--success))" 
              name="Taken" 
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="missed" 
              fill="hsl(var(--destructive))" 
              name="Missed" 
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Adherence Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="taken" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              name="Medicines Taken"
              dot={{ fill: 'hsl(var(--primary))', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-success">90%</p>
          <p className="text-xs text-muted-foreground">Adherence Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">19</p>
          <p className="text-xs text-muted-foreground">Doses Taken</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-destructive">2</p>
          <p className="text-xs text-muted-foreground">Doses Missed</p>
        </div>
      </div>
    </div>
  );
};

export default AdherenceGraph;
