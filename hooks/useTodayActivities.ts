"use client"

import { useQuery } from "@tanstack/react-query"
import { startOfDay, endOfDay } from "date-fns"

export function useTodayActivities() {
  const now = new Date()
  const start = startOfDay(now)
  const end = endOfDay(now)

  return useQuery({
    queryKey: ["activities-today"],
    queryFn: async () => {
      const res = await fetch("/api/activities?status=OPEN")
      if (!res.ok) throw new Error("Erro ao carregar atividades do dia")
      const data = await res.json()
      
      return data.filter((a: any) => {
        if (!a.dueAt) return false
        const d = new Date(a.dueAt)
        return d >= start && d <= end
      })
    }
  })
}
