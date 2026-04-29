"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"

interface UTMPerformanceTableProps {
  data: any[]
}

export function UTMPerformanceTable({ data }: UTMPerformanceTableProps) {
  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-[10px] uppercase font-black tracking-widest text-[#6B7280]">Campanha</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest text-[#6B7280]">Fonte</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest text-[#6B7280]">Mídia</TableHead>
            <TableHead className="text-right text-[10px] uppercase font-black tracking-widest text-[#6B7280]">Leads</TableHead>
            <TableHead className="text-right text-[10px] uppercase font-black tracking-widest text-[#6B7280]">Deals</TableHead>
            <TableHead className="text-right text-[10px] uppercase font-black tracking-widest text-[#6B7280]">Conversão</TableHead>
            <TableHead className="text-right text-[10px] uppercase font-black tracking-widest text-[#6B7280]">Receita</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-[#6B7280] text-sm">Nenhum dado encontrado</TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.campaign} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                <TableCell className="font-bold text-white max-w-[220px] truncate">
                  <div className="flex items-center gap-2">
                    {row.campaign}
                    <ExternalLink className="w-3 h-3 text-[#6B7280] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-orange-500/5 border-orange-500/20 text-orange-400 text-[10px] font-black uppercase">
                    {row.source}
                  </Badge>
                </TableCell>
                <TableCell className="text-[#6B7280] text-[11px] font-bold uppercase tracking-tight">
                  {row.medium || "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-white/80">{row.leads}</TableCell>
                <TableCell className="text-right font-mono text-white/80">{row.deals}</TableCell>
                <TableCell className="text-right">
                  <div className={`flex items-center justify-end gap-1 text-xs font-black ${row.conversion_rate >= 10 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {row.conversion_rate >= 10 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {row.conversion_rate.toFixed(1)}%
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-black text-white tracking-tight">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(row.revenue)}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
