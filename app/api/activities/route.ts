import { NextRequest, NextResponse } from "next/server"
import { auth, getTeamUserIds } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teamUserIds = await getTeamUserIds(session.user.id)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const dealStatus = searchParams.get("dealStatus")
    const dealId = searchParams.get("dealId")

    const where: any = {
      ownerUserId: { in: teamUserIds },
      ...(status && status !== "LOST" && { status: status as "OPEN" | "DONE" }),
      ...(dealStatus && { deal: { status: dealStatus as "OPEN" | "WON" | "LOST" } }),
      ...(dealId && { dealId }),
    }

    if (status === "LOST") {
      where.deal = { status: "LOST" }
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      include: {
        contact: { select: { nome: true, sobrenome: true } },
        deal: { select: { titulo: true } },
      },
    })

    return NextResponse.json(activities)
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
    const { tipo, titulo, descricao, dueAt, contactId, dealId } = body

    if (!tipo || !titulo) {
      return NextResponse.json({ error: "Tipo e título são obrigatórios" }, { status: 400 })
    }

    const activity = await prisma.activity.create({
      data: {
        tipo,
        titulo,
        descricao,
        dueAt: dueAt ? new Date(dueAt) : null,
        contactId,
        dealId,
        ownerUserId: session.user.id,
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
