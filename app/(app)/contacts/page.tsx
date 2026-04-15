"use client"

import { useQuery } from "@tanstack/react-query"
import { Users, Search, Filter, Plus, Mail, Phone, MapPin, Building2, Sparkles, LayoutGrid, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Reusable Component: KPI Card Enterprise ───────────────────────
function KPICard({ 
  label, value, subtext, icon: Icon, trend, color = "var(--accent-blue)" 
}: { 
  label: string; value: string | number; subtext: string; icon: React.ElementType; trend?: string; color?: string 
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon-container" style={{ backgroundColor: `${color}15`, color: color }}>
        <Icon size={20} />
      </div>
      <div className="kpi-label-row">
        <span className="kpi-label">{label}</span>
        {trend && (
           <span className={cn("kpi-trend", trend.includes('+') ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10")}>
              {trend}
           </span>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-subtext">{subtext}</div>
    </div>
  )
}

interface Contact {
  id: string; nome: string; email: string; telefone: string; empresa: string; cargo: string; status: string;
}

export default function ContactsPage() {
  const { data: contactsData, isLoading } = useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await fetch("/api/contacts")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 15_000,
  })

  // Safe data handling
  const contacts = Array.isArray(contactsData) ? contactsData : []

  return (
    <div className="page-container animate-aether">
      
      {/* 1. HEADER DE PÁGINA */}
      <header className="page-header-wrapper">
        <div>
          <div className="breadcrumb-pill">
            <Users size={12} /> GESTÃO DE RELACIONAMENTO
          </div>
          <h1 className="page-title-h1">CRM Contatos</h1>
          <p className="page-subtitle">Diretório mestre de entidades e tomadores de decisão</p>
        </div>
        <button className="btn-cta-primary flex items-center gap-2">
          <Plus size={18} /> Novo Contato
        </button>
      </header>

      {/* 2. KPI CARDS */}
      <div className="kpi-grid">
         <KPICard label="Total de Registros" value={contacts.length} subtext="Dataset mapeado no cluster" icon={Users} color="#3b82f6" />
         <KPICard label="Empresas" value="42" subtext="Inbound e Outbound" icon={Building2} color="#a855f7" />
         <KPICard label="Contatos Mês" value="12" subtext="Aquisição tempo real" icon={Sparkles} trend="+8%" color="#f59e0b" />
         <KPICard label="Health Rate" value="94.1%" subtext="Integridade de dados" icon={ShieldCheck} color="#10b981" />
      </div>

      {/* 3. BARRA DE COMANDOS */}
      <div className="flex bg-[#111318] border border-white/5 p-2 rounded-xl gap-2">
         <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
            <input placeholder="Filtrar diretório..." className="w-full bg-transparent h-10 pl-9 pr-4 text-[13px] border-none focus:outline-none" />
         </div>
         <button className="h-10 px-4 flex items-center gap-2 text-[11px] font-bold uppercase text-white/40 hover:text-white transition-all">
            <Filter size={14} /> Filtros
         </button>
      </div>

      {/* 4. TABELA ENTERPRISE */}
      <div className="enterprise-table-wrapper">
         <div className="table-header-label">Master Directory</div>
         <table className="enterprise-table">
            <thead>
               <tr>
                  <th>Entidade / Cargo</th>
                  <th>Contato Digital</th>
                  <th>Empresa</th>
                  <th className="text-right">Ação</th>
               </tr>
            </thead>
            <tbody>
               {isLoading ? (
                  [...Array(6)].map((_, i) => <tr key={i} className="h-16 animate-pulse bg-white/5"><td colSpan={4} /></tr>)
               ) : contacts.map((contact) => (
                  <tr key={contact.id} className="enterprise-table-row">
                     <td>
                        <div className="font-bold text-white/90">{contact.nome}</div>
                        <div className="text-[10px] text-white/20 uppercase font-black mt-1">{contact.cargo || "Decision Maker"}</div>
                     </td>
                     <td>
                        <div className="text-[12px] font-bold text-white/60">{contact.email}</div>
                        <div className="text-[10px] text-white/20 uppercase font-bold mt-1">{contact.telefone}</div>
                     </td>
                     <td>
                        <div className="inline-flex px-3 py-1 bg-white/5 border border-white/5 rounded-md text-[10px] font-bold uppercase text-white/40">
                           {contact.empresa || 'Individual'}
                        </div>
                     </td>
                     <td className="text-right">
                        <button className="h-9 px-5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold uppercase text-white/30 hover:text-white hover:bg-white/10 transition-all">Perfil</button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  )
}
