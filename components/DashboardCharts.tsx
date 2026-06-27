"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Label,
} from "recharts";

const LIME = "#dffd7b";
const S3 = "#323236";
const MUTED = "rgba(255,255,255,0.4)";
const TEXT = "#f0f0f0";
const BORDER = "rgba(255,255,255,0.08)";

const SECTOR_COLORS: Record<string, string> = {
  civiel:           "#60a5fa",
  elektro:          LIME,
  werktuig:         "#a78bfa",
  bouw:             "#fb923c",
  industrie:        "#f472b6",
  energie:          "#34d399",
  it:               "#facc15",
  projectmanagement:"#e879f9",
};

const PIPELINE_COLORS: Record<string, string> = {
  "Nieuw":       "#60a5fa",
  "Screening":   LIME,
  "Gescreend":   "#a78bfa",
  "Voorgesteld": "#fb923c",
  "Interview":   "#f472b6",
  "Geplaatst":   "#34d399",
  "Afgewezen":   "#6b7280",
};

type SectorData  = { sector: string; count: number };
type PipelineData = { label: string; count: number };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#27272a", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "0.5rem 0.75rem", fontSize: "0.78rem", color: TEXT }}>
      <div style={{ fontWeight: 700, marginBottom: 2 }}>{label}</div>
      <div style={{ color: LIME }}>{payload[0].value} kandidaten</div>
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#27272a", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "0.5rem 0.75rem", fontSize: "0.78rem", color: TEXT }}>
      <div style={{ fontWeight: 700 }}>{payload[0].name}</div>
      <div style={{ color: LIME }}>{payload[0].value} sollicitaties</div>
    </div>
  );
};

export function SectorBarChart({ data }: { data: SectorData[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
        <XAxis dataKey="sector" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.sector} fill={SECTOR_COLORS[entry.sector] ?? LIME} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

const RADIAN = Math.PI / 180;

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, count }: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#1e1e21" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {count}
    </text>
  );
}

export function PipelinePieChart({ data }: { data: PipelineData[] }) {
  const filled = data.filter(d => d.count > 0);
  const totaal = filled.reduce((s, d) => s + d.count, 0);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={filled}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="48%"
          innerRadius={52}
          outerRadius={78}
          paddingAngle={3}
          strokeWidth={0}
          labelLine={false}
          label={<PieLabel />}
        >
          {filled.map((entry) => (
            <Cell key={entry.label} fill={PIPELINE_COLORS[entry.label] ?? LIME} />
          ))}
          <Label
            value={`${totaal} totaal`}
            position="center"
            fill={MUTED}
            fontSize={11}
            fontWeight={500}
          />
        </Pie>
        <Tooltip content={<PieTooltip />} />
        <Legend
          iconType="circle"
          iconSize={7}
          wrapperStyle={{ fontSize: "0.7rem", color: MUTED }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
