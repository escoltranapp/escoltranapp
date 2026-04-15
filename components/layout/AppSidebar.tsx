"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  LayoutGrid,
  List,
  User,
  CalendarDays,
  Search,
  Phone,
  Activity,
  Clock,
  Settings,
  X,
  LogOut,
  UserPlus,
  Sparkles
} from "lucide-react"

import "./sidebar.css"

interface AppSidebarProps {
  onClose?: () => void;
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const userName = session?.user?.name || "Usuário";
  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-icon">E</div>
        <div className="brand-name">Escoltran</div>
      </div>

      {/* Navegação */}
      <div className="nav-container grow">
        
        {/* DASHBOARD */}
        <div className="nav-section">
          <div className="nav-label">Dashboard</div>
          <Link href="/dashboard" onClick={onClose} className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}>
            <LayoutGrid className="nav-item-icon" />
            <span>Overview</span>
          </Link>
        </div>

        {/* COMERCIAL */}
        <div className="nav-section">
          <div className="nav-label">Comercial</div>
          <Link href="/pipeline" onClick={onClose} className={`nav-item ${isActive("/pipeline") ? "active" : ""}`}>
            <List className="nav-item-icon" />
            <span>Pipeline</span>
          </Link>
          <Link href="/contacts" onClick={onClose} className={`nav-item ${isActive("/contacts") ? "active" : ""}`}>
            <User className="nav-item-icon" />
            <span>Contatos</span>
          </Link>
          <Link href="/activities" onClick={onClose} className={`nav-item ${isActive("/activities") ? "active" : ""}`}>
            <CalendarDays className="nav-item-icon" />
            <span>Atividades</span>
          </Link>
        </div>

        {/* MARKETING */}
        <div className="nav-section">
          <div className="nav-label">Marketing</div>
          <Link href="/lead-search" onClick={onClose} className={`nav-item ${isActive("/lead-search") ? "active" : ""}`}>
            <Search className="nav-item-icon" />
            <span>Busca de Leads</span>
          </Link>
          <Link href="/listas-disparo" onClick={onClose} className={`nav-item ${isActive("/listas-disparo") ? "active" : ""}`}>
            <Phone className="nav-item-icon" />
            <span>Disparo em Massa</span>
          </Link>
          <Link href="/utm-analytics" onClick={onClose} className={`nav-item ${isActive("/utm-analytics") ? "active" : ""}`}>
            <Activity className="nav-item-icon" />
            <span>Analytics</span>
          </Link>
          <Link href="/ai-insights" onClick={onClose} className={`nav-item ${isActive("/ai-insights") ? "active" : ""}`}>
            <Clock className="nav-item-icon" />
            <span>Insights</span>
          </Link>
        </div>

        {/* CONFIG */}
        <div className="nav-section">
          <div className="nav-label">Sistema</div>
          <Link href="/settings" onClick={onClose} className={`nav-item ${isActive("/settings") ? "active" : ""}`}>
            <Settings className="nav-item-icon" />
            <span>Configurações</span>
          </Link>
        </div>

      </div>

      {/* BOTTOM SECTION (Regra 6 & 8) */}
      <div className="logout-section mt-auto">
        <div className="user-badge mb-4">
           <div className="user-avatar">{initials}</div>
           <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white truncate">{userName}</p>
              <p className="text-[10px] text-white/40 uppercase font-black">Plan: Scale</p>
           </div>
           <button onClick={() => signOut()} className="p-1 px-2 text-white/20 hover:text-red-500 transition-colors">
              <LogOut size={16} />
           </button>
        </div>
      </div>
    </aside>
  )
}
