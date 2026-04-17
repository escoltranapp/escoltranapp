import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status, titulo, descricao, dueAt, tipo } = body

    const existing = await prisma.activity.findFirst({
      where: { id, ownerUserId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Atividade não encontrada" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (status !== undefined) {
      updateData.status = status
      if (status === "DONE") updateData.doneAt = new Date()
      if (status === "OPEN") updateData.doneAt = null
    }
    if (titulo !== undefined) updateData.titulo = titulo
    if (descricao !== undefined) updateData.descricao = descricao
    if (tipo !== undefined) updateData.tipo = tipo
    if (dueAt !== undefined) updateData.dueAt = dueAt ? new Date(dueAt) : null

    const activity = await prisma.activity.update({
      where: { id },
      data: updateData,
      include: {
        contact: { select: { nome: true, sobrenome: true } },
        deal: { select: { titulo: true } },
      },
    })

    return NextResponse.json(activity)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.activity.findFirst({
      where: { id, ownerUserId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Atividade não encontrada" }, { status: 404 })
    }

    await prisma.activity.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
