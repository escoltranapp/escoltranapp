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
  UserPlus
} from "lucide-react"

import "./sidebar.css"

interface AppSidebarProps {
  onClose?: () => void;
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const userName = session?.user?.name || "Usuário";
  const userRole = "Administrador";
  const usagePercent = 72;

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
        <div>
          <div className="brand-name">Escoltran</div>
          <div className="brand-sub">Sales Intelligence</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="mobile-close-btn md:hidden">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navegação */}
      <div className="nav-container">
        
        {/* DASHBOARD */}
        <div className="nav-section">
          <div className="nav-label">Dashboard</div>
          <Link href="/dashboard" onClick={onClose} className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}>
            <LayoutGrid className="nav-item-icon" />
            <span className="nav-item-label">Overview</span>
            {isActive("/dashboard") && <div className="active-bar"></div>}
          </Link>
        </div>

        {/* COMERCIAL */}
        <div className="nav-section">
          <div className="nav-label">Comercial</div>
          <Link href="/pipeline" onClick={onClose} className={`nav-item ${isActive("/pipeline") ? "active" : ""}`}>
            <List className="nav-item-icon" />
            <span className="nav-item-label">Pipeline</span>
            {isActive("/pipeline") && <div className="active-bar"></div>}
          </Link>
          <Link href="/contacts" onClick={onClose} className={`nav-item ${isActive("/contacts") ? "active" : ""}`}>
            <User className="nav-item-icon" />
            <span className="nav-item-label">Contatos</span>
            {isActive("/contacts") && <div className="active-bar"></div>}
          </Link>
          <Link href="/activities" onClick={onClose} className={`nav-item ${isActive("/activities") ? "active" : ""}`}>
            <CalendarDays className="nav-item-icon" />
            <span className="nav-item-label">Atividades</span>
            {isActive("/activities") && <div className="active-bar"></div>}
          </Link>
        </div>

        {/* MARKETING */}
        <div className="nav-section">
          <div className="nav-label">Marketing</div>
          <Link href="/lead-search" onClick={onClose} className={`nav-item ${isActive("/lead-search") ? "active" : ""}`}>
            <Search className="nav-item-icon" />
            <span className="nav-item-label">Busca de Leads</span>
            {isActive("/lead-search") && <div className="active-bar"></div>}
          </Link>
          <Link href="/listas-disparo" onClick={onClose} className={`nav-item ${isActive("/listas-disparo") ? "active" : ""}`}>
            <Phone className="nav-item-icon" />
            <span className="nav-item-label">Disparo em Massa</span>
            {isActive("/listas-disparo") && <div className="active-bar"></div>}
          </Link>
          <Link href="/utm-analytics" onClick={onClose} className={`nav-item ${isActive("/utm-analytics") ? "active" : ""}`}>
            <Activity className="nav-item-icon" />
            <span className="nav-item-label">UTM Analytics</span>
            {isActive("/utm-analytics") && <div className="active-bar"></div>}
          </Link>
          <Link href="/ai-insights" onClick={onClose} className={`nav-item ${isActive("/ai-insights") ? "active" : ""}`}>
            <Clock className="nav-item-icon" />
            <span className="nav-item-label">IA Insights</span>
            {isActive("/ai-insights") && <div className="active-bar"></div>}
          </Link>
        </div>

        <div className="divider"></div>

        {/* CONFIG */}
        <div className="nav-section">
          <div className="nav-label">Config</div>
          <Link href="/settings" onClick={onClose} className={`nav-item ${isActive("/settings") ? "active" : ""}`}>
            <Settings className="nav-item-icon" />
            <span className="nav-item-label">Configurações</span>
            {isActive("/settings") && <div className="active-bar"></div>}
          </Link>
        </div>

      </div>

      {/* BOTTOM SECTION */}
      <div className="bottom-section">
        
        <div className="workspace-card">
          <div className="workspace-title">Workspace</div>
          <div className="workspace-desc">Gerencie sua equipe com IA.</div>
          <button className="invite-btn">
            <UserPlus size={13} strokeWidth={2} />
            Convidar
          </button>
        </div>

        <div className="usage-bar-wrap">
          <div className="usage-label">
            <span>Uso da base</span>
            <span>{usagePercent}%</span>
          </div>
          <div className="usage-track">
            <div className="usage-fill" style={{ width: `${usagePercent}%` }}></div>
          </div>
        </div>

        <div className="user-row">
          <div className="user-avatar">{initials}</div>
          <div className="user-name-wrapper">
            <div className="user-name">{userName}</div>
            <div className="user-role">{userRole}</div>
          </div>
          <button onClick={() => signOut()} className="logout-btn" title="Sair do sistema">
            <LogOut size={14} />
          </button>
        </div>

      </div>
    </aside>
  );
}
