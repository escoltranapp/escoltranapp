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
    <div className="bg-[#0D0D0D] border border-white/5 rounded-[40px] h-[600px] animate-pulse p-8">
       <div className="w-1/3 h-10 bg-white/5 rounded-2xl mb-12" />
       <div className="grid grid-cols-7 gap-4">
          {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(i => <div key={i} className="h-32 bg-white/[0.03] rounded-3xl" />)}
       </div>
    </div>
  )

  return (
    <div className="bg-[#0D0D0D] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in duration-700">
      {/* CALENDAR HEADER */}
      <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
        <div>
          <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h3>
          <p className="text-[10px] font-mono text-secondary uppercase tracking-[0.4em] mt-1 font-black underline decoration-primary/30">
            Timeline de Engajamento
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={goToday}
            className="px-6 py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:border-primary/50 transition-all mr-2"
          >
            Hoje
          </button>
          <button
            onClick={prevMonth}
            className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-white"
          >
            <span className="material-symbols-outlined text-[24px]">chevron_left</span>
          </button>
          <button
            onClick={nextMonth}
            className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-white"
          >
            <span className="material-symbols-outlined text-[24px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* DAYS OF WEEK */}
      <div className="grid grid-cols-7 border-b border-white/5">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div
            key={day}
            className="py-6 text-center text-[11px] font-black uppercase tracking-[0.3em] text-secondary italic border-r border-white/5 last:border-r-0 bg-white/[0.02]"
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
                "min-h-[160px] p-4 border-r border-b border-white/5 group transition-all relative overflow-hidden",
                !isCurrentMonth && "bg-black/40 opacity-20",
                isTodayDate && "bg-primary/[0.03]"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className={cn(
                    "text-[14px] font-black font-mono tracking-tighter w-8 h-8 flex items-center justify-center rounded-xl transition-all",
                    isTodayDate
                      ? "bg-primary text-black shadow-lg shadow-primary/30 scale-110"
                      : "text-secondary group-hover:text-white"
                  )}
                >
                  {format(day, "d")}
                </span>
                {dayActivities.length > 0 && (
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#F97316]" />
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
