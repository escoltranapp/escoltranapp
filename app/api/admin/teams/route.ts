import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const teams = await prisma.team.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const formattedTeams = teams.map(t => ({
      id: t.id,
      name: t.name,
      membersCount: t._count.members,
      createdAt: t.createdAt
    }))

    return NextResponse.json(formattedTeams)
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { name } = await req.json()
    if (!name) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })

    const team = await prisma.team.create({
      data: { name }
    })

    return NextResponse.json(team)
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
