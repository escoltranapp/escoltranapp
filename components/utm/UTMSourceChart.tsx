"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

const COLORS = [
  "#0070F3", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
]

interface UTMSourceChartProps {
  data: any[]
}

export function UTMSourceChart({ data }: UTMSourceChartProps) {
  const totalLeads = data.reduce((acc, item) => acc + item.leads, 0)

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="leads"
            nameKey="source"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#0A0A0A",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px",
            }}
            itemStyle={{ color: "#fff" }}
            formatter={(value: any, name: any, props: any) => [
              `Leads: ${value} (${((Number(value) / totalLeads) * 100).toFixed(0)}%) | R$ ${props.payload.revenue.toLocaleString('pt-BR')}`,
              props.payload.source,
            ]}
          />
          <Legend 
            verticalAlign="bottom" 
            align="center"
            iconType="circle"
            formatter={(value) => <span className="text-[10px] text-[#6B7280] font-bold uppercase">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
