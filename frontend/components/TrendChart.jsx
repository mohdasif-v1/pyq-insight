"use client";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded border border-app-border bg-app-surface p-2.5 text-xs space-y-0.5 font-mono shadow-popover">
        <p className="text-text-muted text-[10px]">SESSION: {label}</p>
        <p className="text-indigo-lavender font-semibold">{payload[0].value} Questions Ingested</p>
      </div>
    );
  }
  return null;
};

export default function TrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-xs text-text-muted font-mono">
        No historical exam volume trends recorded yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 2" stroke="#292456" opacity={0.6} />
        <XAxis
          dataKey="year"
          stroke="#7A739E"
          fontSize={10}
          fontFamily="monospace"
          tickLine={false}
          axisLine={{ stroke: "#292456" }}
        />
        <YAxis
          allowDecimals={false}
          stroke="#7A739E"
          fontSize={10}
          fontFamily="monospace"
          tickLine={false}
          axisLine={{ stroke: "#292456" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="questions"
          stroke="#433D8B"
          strokeWidth={2}
          dot={{ r: 3, fill: "#2E236C", stroke: "#C8ACD6", strokeWidth: 1.5 }}
          activeDot={{ r: 4, fill: "#C8ACD6" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
