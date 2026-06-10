"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SOURCE_COLORS = ["#e8a598", "#f5c4b8", "#c97b6a", "#8b5a52", "#d4a574", "#a67c52"];

const SOURCE_LABELS: Record<string, string> = {
  explore: "Explore",
  direct: "Direct link",
  share: "Shared link",
  search: "Search",
  category: "Category page",
  tag: "Tag page",
};

export function InsightsCharts({
  viewsByDay,
  viewsBySource,
}: {
  viewsByDay: { date: string; count: number }[];
  viewsBySource: { source: string; count: number }[];
  period: string;
}) {
  const dayData = viewsByDay.map((d) => ({
    label: d.date.slice(5),
    count: d.count,
  }));

  const sourceData = viewsBySource.map((s) => ({
    name: SOURCE_LABELS[s.source] ?? s.source,
    value: s.count,
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-outline-variant/20 bg-bg-elevated p-4">
        <h3 className="mb-4 text-sm font-semibold text-on-surface">Views per day</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayData}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
              <Tooltip />
              <Bar dataKey="count" fill="#e8a598" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant/20 bg-bg-elevated p-4">
        <h3 className="mb-4 text-sm font-semibold text-on-surface">Where people find you</h3>
        <div className="h-48 w-full">
          {sourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {sourceData.map((_, i) => (
                    <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-on-surface-variant">
              No traffic data yet.
            </p>
          )}
        </div>
        <ul className="mt-2 flex flex-wrap gap-2">
          {sourceData.map((s, i) => (
            <li key={`${s.name || "source"}-${i}`} className="flex items-center gap-1 text-[11px] text-on-surface-variant">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }}
              />
              {s.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
