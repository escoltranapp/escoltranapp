"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

const COLORS = [
  "#F97316", // Orange (Primary)
  "#FB923C", // Light Orange
  "#EA580C", // Dark Orange
  "#F59E0B", // Amber
  "#D97706", // Dark Amber
  "#B45309", // Rust
  "#78350F", // Deep Brown
  "#FDBA74", // Peach
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
