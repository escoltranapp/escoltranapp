"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface SourceData {
  name: string
  value: number
}

interface UTMSourceChartProps {
  data: SourceData[]
}

const COLORS = ["#0070F3", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]

export function UTMSourceChart({ data }: UTMSourceChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0)

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-white mb-6">Distribuição por Fonte</h3>
      
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#0A0A0A", 
                border: "1px solid rgba(255,255,255,0.05)", 
                borderRadius: "12px",
                color: "#fff",
                fontSize: "12px"
              }}
              itemStyle={{ color: "#fff" }}
              formatter={(value: any) => [
                `${value} (${total > 0 ? ((Number(value) / total) * 100).toFixed(0) : 0}%)`,
                "Leads"
              ]}
            />
            <Legend 
              verticalAlign="bottom" 
              align="center"
              iconType="circle"
              formatter={(value, entry: any) => {
                const item = data.find(d => d.name === value)
                const percentage = item ? ((item.value / total) * 100).toFixed(0) : 0
                return <span className="text-[10px] text-[#6B7280] font-bold uppercase">{value} ({percentage}%)</span>
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
