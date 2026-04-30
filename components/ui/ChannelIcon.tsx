"use client"

import { cn } from "@/lib/utils"

interface ChannelIconProps {
  channel: string
  className?: string
}

export function ChannelIcon({ channel, className }: ChannelIconProps) {
  const c = channel?.toLowerCase() || ""

  // GOOGLE LOGO
  if (c.includes("google")) {
    return (
      <svg viewBox="0 0 24 24" className={cn("w-4 h-4", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21.81-.63z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    )
  }

  // INSTAGRAM LOGO (CUSTOM SVG)
  if (c.includes("instagram")) {
    return (
      <svg viewBox="0 0 24 24" className={cn("w-4 h-4", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" className="text-[#E1306C]" />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" className="text-[#E1306C]" />
        <circle cx="18" cy="6" r="1.5" fill="currentColor" className="text-[#E1306C]" />
      </svg>
    )
  }

  // WHATSAPP LOGO
  if (c.includes("whatsapp")) {
    return (
      <span className={cn("material-symbols-outlined text-[16px] text-[#25D366]", className)}>chat</span>
    )
  }

  // FACEBOOK LOGO
  if (c.includes("facebook")) {
    return (
      <span className={cn("material-symbols-outlined text-[16px] text-[#1877F2]", className)}>facebook</span>
    )
  }

  // INDICAÇÃO (REFERRAL)
  if (c.includes("indicação") || c.includes("indicacao")) {
    return (
      <span className={cn("material-symbols-outlined text-[16px] text-amber-500", className)}>handshake</span>
    )
  }

  // DEFAULT
  return (
    <span className={cn("material-symbols-outlined text-[16px] text-[#404040]", className)}>hub</span>
  )
}
