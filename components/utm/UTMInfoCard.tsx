"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Globe, MousePointer2, MapPin, Calendar } from "lucide-react"

interface UTMInfoCardProps {
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmContent?: string | null
  utmTerm?: string | null
  capturedAt?: string | Date | null
  landingPage?: string | null
  referrer?: string | null
}

export function UTMInfoCard(props: UTMInfoCardProps) {
  const { utmSource, utmMedium, utmCampaign, utmContent, utmTerm, capturedAt, landingPage, referrer } = props

  const fields = [
    { label: 'Fonte', value: utmSource, icon: Globe },
    { label: 'Mídia', value: utmMedium, icon: MousePointer2 },
    { label: 'Campanha', value: utmCampaign, icon: MapPin },
    { label: 'Conteúdo', value: utmContent, icon: MapPin },
    { label: 'Termo', value: utmTerm, icon: MapPin },
    { label: 'Landing Page', value: landingPage, icon: Globe },
    { label: 'Referrer', value: referrer, icon: Globe },
    {
      label: 'Capturado em',
      value: capturedAt
        ? format(new Date(capturedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
        : null,
      icon: Calendar
    },
  ]

  const activeFields = fields.filter(f => f.value)
  if (activeFields.length === 0) return null

  return (
    <Card className="bg-[#0A0A0A] border-white/5">
      <CardHeader className="pb-4">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Rastreamento UTM</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeFields.map((f) => (
          <div key={f.label} className="flex flex-col gap-1">
            <p className="text-[9px] font-black uppercase tracking-tighter text-[#6B7280] flex items-center gap-1">
              <f.icon className="w-2.5 h-2.5" />
              {f.label}
            </p>
            <Badge variant="outline" className="bg-white/5 border-white/5 text-[10px] font-bold text-white py-1 w-fit max-w-full truncate">
              {f.value}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
