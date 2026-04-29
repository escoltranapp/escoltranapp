"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface UTMAdTableProps {
  data: any[]
}

export function UTMAdTable({ data }: UTMAdTableProps) {
  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-[10px] uppercase font-black tracking-widest text-[#6B7280]">Anúncio</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest text-[#6B7280]">Adset / Campanha</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest text-[#6B7280]">Fonte</TableHead>
            <TableHead className="text-right text-[10px] uppercase font-black tracking-widest text-[#6B7280]">Leads</TableHead>
            <TableHead className="text-right text-[10px] uppercase font-black tracking-widest text-[#6B7280]">Ganhos</TableHead>
            <TableHead className="text-right text-[10px] uppercase font-black tracking-widest text-[#6B7280]">Pipeline</TableHead>
            <TableHead className="text-right text-[10px] uppercase font-black tracking-widest text-[#6B7280]">Receita</TableHead>
            <TableHead className="text-right text-[10px] uppercase font-black tracking-widest text-[#6B7280]">Conv.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-[#6B7280] text-sm">Nenhum dado encontrado</TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.name} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                <TableCell className="font-bold text-white max-w-[180px] truncate">{row.name}</TableCell>
                <TableCell className="text-[#6B7280] text-[11px] font-bold max-w-[160px] truncate">
                  {row.adset || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-white/5 border-white/5 text-[#6B7280] text-[10px] font-black uppercase">
                    {row.source}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-white/80">{row.leads}</TableCell>
                <TableCell className="text-right font-mono text-white/80">{row.won}</TableCell>
                <TableCell className="text-right text-[#6B7280] font-mono text-[11px]">
                  R$ {row.pipeline_value.toLocaleString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-black text-white tracking-tight">
                    R$ {row.revenue.toLocaleString('pt-BR')}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-[11px] font-black text-orange-400">
                    {row.leads ? ((row.won / row.leads) * 100).toFixed(1) : 0}%
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
