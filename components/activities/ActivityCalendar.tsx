"use client"

import { useState, useEffect } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ActivityCalendarProps {
  activities: any[]
  onEdit: (activity: any) => void
}

const TYPE_COLORS: Record<string, string> = {
  CALL: "#3B82F6",
  MEETING: "#8B5CF6",
  TASK: "#F59E0B",
  NOTE: "#6B7280",
  WHATSAPP: "#22C55E",
  EMAIL: "#EC4899",
}

export function ActivityCalendar({ activities, onEdit }: ActivityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 1. Cálculos de datas
  const firstDayOfMonth = startOfMonth(currentDate)
  const lastDayOfMonth = endOfMonth(currentDate)
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 })
  const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const nextMonth = () => setCurrentDate((d) => addMonths(d, 1))
  const prevMonth = () => setCurrentDate((d) => subMonths(d, 1))
  const goToday = () => setCurrentDate(new Date())

  const safeActivities = Array.isArray(activities) ? activities : []

  // 2. Trava de 'mounted' condicional APENAS no retorno do JSX
  if (!mounted) return (
    <div className="bg-[#0D0D0D] border border-white/5 rounded-[32px] h-[500px] animate-pulse p-6">
       <div className="w-1/4 h-8 bg-white/5 rounded-xl mb-10" />
       <div className="grid grid-cols-7 gap-3">
          {[1,2,3,4,5,6,7].map(i => <div key={i} className="h-20 bg-white/[0.03] rounded-2xl" />)}
       </div>
    </div>
  )

  return (
    <div className="bg-[#0D0D0D] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in duration-700">
      {/* CALENDAR HEADER */}
      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
        <div>
          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h3>
          <p className="text-[9px] font-mono text-secondary uppercase tracking-[0.3em] mt-1 font-black">
            Timeline de Engajamento
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="px-4 py-2 rounded-lg border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-primary/10 transition-all"
          >
            Hoje
          </button>
          <button
            onClick={prevMonth}
            className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-white"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button
            onClick={nextMonth}
            className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-white"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* DAYS OF WEEK */}
      <div className="grid grid-cols-7 border-b border-white/5">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div
            key={day}
            className="py-3 text-center text-[9px] font-black uppercase tracking-[0.2em] text-secondary italic border-r border-white/5 last:border-r-0 bg-white/[0.02]"
          >
            {day}
          </div>
        ))}
      </div>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayActivities = safeActivities.filter((a) => {
            if (!a?.dueAt) return false
            const d = new Date(a.dueAt)
            return !isNaN(d.getTime()) && isSameDay(d, day)
          })

          const isTodayDate = isSameDay(day, new Date())
          const isCurrentMonth = isSameMonth(day, currentDate)

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[100px] p-3 border-r border-b border-white/5 group transition-all relative overflow-hidden",
                !isCurrentMonth && "bg-black/40 opacity-20",
                isTodayDate && "bg-primary/[0.03]"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={cn(
                    "text-[11px] font-black font-mono tracking-tighter w-6 h-6 flex items-center justify-center rounded-lg transition-all",
                    isTodayDate
                      ? "bg-primary text-black shadow-lg shadow-primary/30"
                      : "text-secondary group-hover:text-white"
                  )}
                >
                  {format(day, "d")}
                </span>
                {dayActivities.length > 0 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>

              <div className="space-y-1.5">
                {dayActivities.slice(0, 4).map((act) => (
                  <button
                    key={act.id}
                    onClick={() => onEdit(act)}
                    className={cn(
                      "w-full text-left px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter truncate border transition-all hover:translate-x-1 active:scale-95",
                      act.status === "DONE" ? "opacity-30 grayscale" : "opacity-100"
                    )}
                    style={{
                      backgroundColor: `${String(TYPE_COLORS[act.tipo] ?? "#6B7280")}15`,
                      borderColor: `${String(TYPE_COLORS[act.tipo] ?? "#6B7280")}30`,
                      color: String(TYPE_COLORS[act.tipo] ?? "#6B7280"),
                    }}
                  >
                    {String(act.titulo || "Sem título")}
                  </button>
                ))}
                {dayActivities.length > 4 && (
                  <div className="text-[8px] font-black text-secondary text-center uppercase tracking-widest mt-2 opacity-50">
                    + {dayActivities.length - 4} atividades
                  </div>
                )}
              </div>

              {isTodayDate && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
