"use client";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-dark-border bg-dark-card p-2.5 shadow-card text-xs space-y-1">
        <p className="text-slate-400 font-medium font-mono">Exam Year: {label}</p>
        <p className="text-brand-primary font-bold">{payload[0].value} Questions Segmented</p>
      </div>
    );
  }
  return null;
};

export default function TrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center text-xs text-slate-500">
        No historical trends recorded for this subject yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#283142" opacity={0.5} />
        <XAxis
          dataKey="year"
          stroke="#707C90"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: "#283142" }}
        />
        <YAxis
          allowDecimals={false}
          stroke="#707C90"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: "#283142" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="questions"
          stroke="#8B9CF6"
          strokeWidth={2}
          dot={{ r: 4, fill: "#8B9CF6", stroke: "#151A23", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "#8B9CF6" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
