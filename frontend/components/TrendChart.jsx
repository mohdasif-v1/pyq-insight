"use client";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-canvas-border bg-canvas-deep/95 p-3 text-xs space-y-1 font-mono shadow-glass backdrop-blur-md">
        <p className="text-ink-muted text-[10px]">SESSION: {label}</p>
        <p className="text-brand-lavender font-bold">{payload[0].value} Questions Ingested</p>
      </div>
    );
  }
  return null;
};

export default function TrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-xs text-ink-muted font-mono">
        No historical exam volume trends recorded yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 172, 214, 0.08)" />
        <XAxis
          dataKey="year"
          stroke="#847F9D"
          fontSize={10}
          fontFamily="monospace"
          tickLine={false}
          axisLine={{ stroke: "rgba(200, 172, 214, 0.15)" }}
        />
        <YAxis
          allowDecimals={false}
          stroke="#847F9D"
          fontSize={10}
          fontFamily="monospace"
          tickLine={false}
          axisLine={{ stroke: "rgba(200, 172, 214, 0.15)" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="questions"
          stroke="#C8ACD6"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#2E236C", stroke: "#C8ACD6", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "#38BDF8" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
