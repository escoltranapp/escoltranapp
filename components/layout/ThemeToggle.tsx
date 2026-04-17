"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return (
    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 animate-pulse" />
  )

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "group relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-500",
        "bg-surface border border-border hover:border-primary/40",
        "shadow-2xl overflow-hidden"
      )}
      title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
    >
      {/* AMBIENT GLOW BEHIND ICON */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-primary blur-md"
      )} />
      
      <div className="relative z-10 flex flex-col items-center transition-transform duration-700" style={{ transform: isDark ? 'translateY(0)' : 'translateY(-40px)' }}>
        <span className="material-symbols-outlined text-[20px] h-10 flex items-center text-primary drop-shadow-[0_0_8px_#F97316]">dark_mode</span>
        <span className="material-symbols-outlined text-[20px] h-10 flex items-center text-[#475569] drop-shadow-[0_0_8px_rgba(71,85,105,0.2)]">light_mode</span>
      </div>
    </button>
  )
}
