import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "google" // "google" | "cnpj"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 3600 * 1000)

    if (type === "cnpj") {
      const [leads, total, today, week] = await Promise.all([
        prisma.leadCnpj.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.leadCnpj.count({ where: { userId: session.user.id } }),
        prisma.leadCnpj.count({ where: { userId: session.user.id, createdAt: { gte: startOfDay } } }),
        prisma.leadCnpj.count({ where: { userId: session.user.id, createdAt: { gte: startOfWeek } } }),
      ])
      return NextResponse.json({ leads, total, today, week, page, limit })
    }

    // Google leads
    const [leads, total, today, week] = await Promise.all([
      prisma.lead.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where: { userId: session.user.id } }),
      prisma.lead.count({ where: { userId: session.user.id, createdAt: { gte: startOfDay } } }),
      prisma.lead.count({ where: { userId: session.user.id, createdAt: { gte: startOfWeek } } }),
    ])

    return NextResponse.json({ leads, total, today, week, page, limit })
  } catch (error) {
    console.error("GET /api/leads error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { type = "google", leads } = body

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: "Nenhum lead fornecido" }, { status: 400 })
    }

    if (type === "cnpj") {
      const created = await prisma.$transaction(
        leads.map((lead: { cnpj: string; nome: string; telefone?: string; cnae?: string; cidade?: string; uf?: string; situacao?: string; email?: string }) =>
          prisma.leadCnpj.create({
            data: {
              cnpj: lead.cnpj || "",
              nome: lead.nome || "",
              telefone: lead.telefone,
              cnae: lead.cnae,
              cidade: lead.cidade,
              uf: lead.uf,
              situacao: lead.situacao,
              email: lead.email,
              userId: session.user.id,
            },
          })
        )
      )
      return NextResponse.json({ created: created.length }, { status: 201 })
    }

    // Google leads
    const created = await prisma.$transaction(
      leads.map((lead: { nome: string; telefone?: string; endereco?: string; cidade?: string; uf?: string; nicho?: string; site?: string }) =>
        prisma.lead.create({
          data: {
            nome: lead.nome || "",
            telefone: lead.telefone,
            endereco: lead.endereco,
            cidade: lead.cidade,
            uf: lead.uf,
            nicho: lead.nicho,
            site: lead.site,
            userId: session.user.id,
          },
        })
      )
    )

    return NextResponse.json({ created: created.length }, { status: 201 })
  } catch (error) {
    console.error("POST /api/leads error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
