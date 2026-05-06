"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ImportDealsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ImportDealsModal({ isOpen, onClose }: ImportDealsModalProps) {
  const [dragActive, setDragActive] = useState(false)

  if (!isOpen) return null

  const handleDownloadTemplate = (type: "csv" | "xlsx") => {
    const headers = "nome,telefone,email,titulo,valor,empresa"
    const row = "João Silva,11999999999,joao@exemplo.com,Venda de Software,5000,Empresa ABC"
    const csvContent = `${headers}\n${row}`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `escoltran_modelo_deals.${type}`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl w-full max-w-[700px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/[0.05] flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-[#F97316] text-2xl">table_chart</span>
              <h2 className="text-xl font-bold text-white tracking-tight">Importar deals em massa</h2>
            </div>
            
            {/* Stepper */}
            <div className="flex items-center gap-3 text-[13px] font-medium">
              <span className="text-[#F97316] bg-[#F97316]/10 px-2 py-1 rounded-md">1. Planilha</span>
              <span className="material-symbols-outlined text-[#404040] text-[16px]">arrow_forward</span>
              <span className="text-[#A3A3A3]">2. Atribuição</span>
              <span className="material-symbols-outlined text-[#404040] text-[16px]">arrow_forward</span>
              <span className="text-[#A3A3A3]">3. Importar</span>
            </div>
          </div>
          
          <button onClick={onClose} className="text-[#A3A3A3] hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleDownloadTemplate("xlsx")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-transparent text-white text-xs font-bold hover:bg-white/[0.02] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Modelo .xlsx
              </button>
              <button 
                onClick={() => handleDownloadTemplate("csv")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-transparent text-white text-xs font-bold hover:bg-white/[0.02] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Modelo .csv
              </button>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-[#A3A3A3]">
              Colunas:
              <span className="bg-[#1A1A1A] border border-white/[0.05] px-2 py-0.5 rounded font-mono text-[11px] text-[#D4D4D4]">nome</span>,
              <span className="bg-[#1A1A1A] border border-white/[0.05] px-2 py-0.5 rounded font-mono text-[11px] text-[#D4D4D4]">telefone</span>
            </div>
          </div>

          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 transition-all relative overflow-hidden",
              dragActive ? "border-[#F97316] bg-[#F97316]/5" : "border-white/[0.08] bg-transparent hover:bg-white/[0.02]"
            )}
          >
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept=".csv,.xlsx"
            />
            <span className="material-symbols-outlined text-[40px] text-[#A3A3A3]">upload</span>
            <div className="text-center">
              <h3 className="text-white text-sm font-bold mb-1">Arraste sua planilha aqui ou clique para selecionar</h3>
              <p className="text-[#6B7280] text-xs">Aceita .xlsx ou .csv</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/[0.05] flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-white/[0.08] text-white text-[13px] font-bold hover:bg-white/[0.02] transition-colors"
          >
            Cancelar
          </button>
          <button 
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-br from-[#F97316] to-[#FB923C] hover:scale-[1.02] shadow-[0_10px_20px_rgba(249,115,22,0.2)] text-white text-[13px] font-bold transition-all"
          >
            Avançar
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

      </div>
    </div>
  )
}
