"use client"

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface UTMTimelineChartProps {
  data: any[]
}

export function UTMTimelineChart({ data }: UTMTimelineChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="dealsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#404040"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => format(parseISO(v), "dd/MM", { locale: ptBR })}
          />
          <YAxis 
            stroke="#404040" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(v) => Number(v) >= 1000 ? `${v/1000}k` : v}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0A0A0A",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px",
            }}
            labelFormatter={(v) => format(parseISO(v as string), "dd 'de' MMMM, yyyy", { locale: ptBR })}
          />
          <Area 
            type="monotone" 
            dataKey="leads" 
            name="Leads" 
            stroke="#F97316" 
            fill="url(#leadsGrad)" 
            strokeWidth={3}
            animationDuration={2000}
          />
          <Area 
            type="monotone" 
            dataKey="deals" 
            name="Deals" 
            stroke="#F59E0B" 
            fill="url(#dealsGrad)" 
            strokeWidth={3}
            animationDuration={2500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
