import { cn } from "@/lib/utils"

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { data: session } = useSession()

  return (
    <header className="fixed top-0 right-0 left-0 md:left-[256px] h-16 bg-background/80 backdrop-blur-xl border-b border-border z-40 px-6">
      <div className="h-full max-w-[1600px] mx-auto flex items-center justify-between gap-6">
        
        {/* MOBILE MENU TRIGGER */}
        <button 
          onClick={onMenuClick}
          className="md:hidden w-10 h-10 flex items-center justify-center text-secondary"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* TOPBAR UTILITIES AREA - MINIMALIST */}
        <div className="flex-1 flex justify-end items-center" />
      </div>
    </header>
  )
}
