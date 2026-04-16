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
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      userId: session.user.id,
      ...(search && {
        OR: [
          { nome: { contains: search, mode: "insensitive" },  },
          { sobrenome: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { empresa: { contains: search, mode: "insensitive" } },
          { telefone: { contains: search } },
        ],
      }),
      ...(status && { status }),
    }

    const [contacts, total, counts] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { deals: true, activities: true } } },
      }),
      prisma.contact.count({ where }),
      // Tab counts
      Promise.all([
        prisma.contact.count({ where: { userId: session.user.id } }),
        prisma.contact.count({ where: { userId: session.user.id, status: "lead" } }),
        prisma.contact.count({ where: { userId: session.user.id, status: "cliente" } }),
        prisma.contact.count({ where: { userId: session.user.id, status: "inativo" } }),
      ]),
    ])

    const [totalAll, totalLeads, totalClientes, totalInativos] = counts

    return NextResponse.json({
      contacts,
      total,
      page,
      limit,
      counts: { all: totalAll, leads: totalLeads, clientes: totalClientes, inativos: totalInativos },
    })
  } catch (error) {
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
    const {
      nome, sobrenome, email, telefone, empresa, cargo,
      status = "lead", canalOrigem, etapaFunil = "Lead",
      documento, tags = [], notas, lgpdConsent = false,
    } = body

    if (!nome) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    const contact = await prisma.contact.create({
      data: {
        nome,
        sobrenome,
        email,
        telefone,
        empresa,
        cargo,
        status,
        canalOrigem,
        etapaFunil,
        documento,
        tags,
        notas,
        lgpdConsent,
        userId: session.user.id,
      },
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
