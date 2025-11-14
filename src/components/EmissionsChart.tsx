import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = {
  transport: "hsl(152 65% 45%)",
  food: "hsl(168 60% 50%)",
  shopping: "hsl(142 70% 45%)",
  energy: "hsl(38 92% 50%)",
  waste: "hsl(0 84% 60%)",
};

interface EmissionsChartProps {
  data: { name: string; value: number }[];
}

const EmissionsChart = ({ data }: EmissionsChartProps) => {
  const chartData = data.map((item) => ({
    ...item,
    color: COLORS[item.name as keyof typeof COLORS] || COLORS.transport,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => `${value.toFixed(1)} kg CO₂`}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default EmissionsChart;
