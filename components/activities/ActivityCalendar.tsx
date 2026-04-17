"use client"

import { useState } from "react"
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
  subMonths 
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ActivityCalendarProps {
  activities: any[]
  onEdit: (activity: any) => void
}

const TYPE_COLORS: Record<string, string> = {
  CALL: '#3B82F6',
  MEETING: '#8B5CF6',
  TASK: '#F59E0B',
  NOTE: '#6B7280',
  WHATSAPP: '#22C55E',
  EMAIL: '#EC4899',
}

export function ActivityCalendar({ activities, onEdit }: ActivityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const firstDayOfMonth = startOfMonth(currentDate)
  const lastDayOfMonth = endOfMonth(currentDate)
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 })
  const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToday = () => setCurrentDate(new Date())

  return (
    <div className="bg-surface border border-border rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in duration-500">
      {/* CALENDAR HEADER */}
      <div className="p-8 border-b border-border flex items-center justify-between bg-foreground/[0.01]">
        <div>
          <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h3>
          <p className="text-[10px] font-mono text-secondary uppercase tracking-[0.3em] mt-1">Timeline Operacional</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={goToday}
            className="px-4 py-2 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:border-primary/50 transition-all mr-2"
          >
            Hoje
          </button>
          <button onClick={prevMonth} className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-foreground/[0.05] transition-all">
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button onClick={nextMonth} className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-foreground/[0.05] transition-all">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* DAYS OF WEEK */}
      <div className="grid grid-cols-7 border-b border-border">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-secondary italic border-r border-border last:border-r-0 bg-foreground/[0.02]">
            {day}
          </div>
        ))}
      </div>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7 border-collapse">
        {days.map((day, idx) => {
          const dayActivities = activities.filter(a => a.dueAt && isSameDay(new Date(a.dueAt), day))
          const isTodayDate = isSameDay(day, new Date())
          const isCurrentMonth = isSameMonth(day, currentDate)

          return (
            <div 
              key={day.toString()} 
              className={cn(
                "min-h-[140px] p-3 border-r border-b border-border group transition-all relative overflow-hidden",
                !isCurrentMonth && "bg-foreground/[0.01] opacity-20",
                isTodayDate && "bg-primary/[0.02]"
              )}
            >
              {/* DATE NUMBER */}
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "text-[12px] font-black font-mono tracking-tighter w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                  isTodayDate ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-secondary group-hover:text-foreground"
                )}>
                  {format(day, "d")}
                </span>
                {dayActivities.length > 0 && (
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </div>

              {/* ACTIVITY BLOCKS */}
              <div className="space-y-1">
                {dayActivities.slice(0, 3).map((act) => (
                  <button
                    key={act.id}
                    onClick={() => onEdit(act)}
                    className={cn(
                      "w-full text-left px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter truncate border transition-all hover:scale-105 active:scale-95",
                      act.status === "DONE" ? "opacity-40 grayscale" : "opacity-100"
                    )}
                    style={{ 
                      backgroundColor: `${TYPE_COLORS[act.tipo]}10`, 
                      borderColor: `${TYPE_COLORS[act.tipo]}30`,
                      color: TYPE_COLORS[act.tipo]
                    }}
                  >
                    {act.titulo}
                  </button>
                ))}
                {dayActivities.length > 3 && (
                  <div className="text-[8px] font-black text-secondary text-center uppercase tracking-widest mt-1">
                    + {dayActivities.length - 3} mais
                  </div>
                )}
              </div>
              
              {/* CURRENT DAY ACCENT */}
              {isTodayDate && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
