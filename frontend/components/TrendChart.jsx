"use client";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-slate-750 bg-slate-900 p-2 shadow-2xl text-xs space-y-0.5 font-mono">
        <p className="text-slate-400 text-[10px]">SESSION: {label}</p>
        <p className="text-blue-400 font-bold">{payload[0].value} Questions Extracted</p>
      </div>
    );
  }
  return null;
};

export default function TrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-xs text-slate-500 font-mono">
        No historical exam volume trends recorded yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
        <XAxis
          dataKey="year"
          stroke="#475569"
          fontSize={10}
          fontFamily="monospace"
          tickLine={false}
          axisLine={{ stroke: "#1E293B" }}
        />
        <YAxis
          allowDecimals={false}
          stroke="#475569"
          fontSize={10}
          fontFamily="monospace"
          tickLine={false}
          axisLine={{ stroke: "#1E293B" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="questions"
          stroke="#2563EB"
          strokeWidth={2}
          dot={{ r: 3, fill: "#2563EB", stroke: "#090A0F", strokeWidth: 1.5 }}
          activeDot={{ r: 5, fill: "#38BDF8" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
