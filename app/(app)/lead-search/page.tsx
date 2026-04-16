"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

function KPICard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px] text-[#F97316]">{icon}</span>
        </div>
      </div>
      <div className="text-[10px] font-mono text-[#6B7280] uppercase tracking-[0.2em] font-black mb-1 italic">{label}</div>
      <div className="text-2xl font-black text-white tracking-tighter font-mono">{value}</div>
    </div>
  )
}

export default function LeadSearchPage() {
  return (
    <div className="animate-in fade-in duration-700 pb-24">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Busca de Leads</h1>
        <p className="text-[#6B7280] text-[15px] mt-2 font-bold tracking-tight">Crawler de alta performance e mineração de dados B2B</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <KPICard label="Leads Encontrados" value="4.812" icon="search" />
        <KPICard label="Dataset Mensal" value="+1.2k" icon="dataset" />
        <KPICard label="Match Rate" value="94.2%" icon="target" />
        <KPICard label="Sincronizados" value="3.1k" icon="sync" />
      </div>

      <div className="bg-[#1A1A1A] border border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center min-h-[400px] border-dashed">
         <span className="material-symbols-outlined text-[64px] text-[#262626]">manage_search</span>
         <div className="text-[14px] font-black text-[#404040] tracking-widest uppercase mt-6 italic">Inicie uma nova orquestração de busca</div>
         <button className="mt-8 bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-black px-8 py-3 rounded-xl uppercase tracking-widest text-[12px] shadow-lg shadow-[#F97316]/20">Iniciar Crawler</button>
      </div>
    </div>
  )
}
