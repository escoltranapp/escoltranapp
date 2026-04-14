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
    const {
      stageId,
      status,
      titulo,
      valorEstimado,
      prioridade,
      origem,
      motivoPerda,
      contactId,
    } = body

    // Verify ownership
    const existing = await prisma.deal.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Deal não encontrado" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (stageId !== undefined) updateData.stageId = stageId
    if (status !== undefined) {
      updateData.status = status
      if (status === "WON" || status === "LOST") {
        updateData.fechadoEm = new Date()
      }
    }
    if (titulo !== undefined) updateData.titulo = titulo
    if (valorEstimado !== undefined) updateData.valorEstimado = parseFloat(valorEstimado)
    if (prioridade !== undefined) updateData.prioridade = prioridade
    if (origem !== undefined) updateData.origem = origem
    if (motivoPerda !== undefined) updateData.motivoPerda = motivoPerda
    if (contactId !== undefined) updateData.contactId = contactId

    const deal = await prisma.deal.update({
      where: { id },
      data: updateData,
      include: {
        contact: { select: { nome: true, sobrenome: true, email: true } },
        stage: true,
      },
    })

    // Record stage change in history
    if (stageId && stageId !== existing.stageId) {
      await prisma.dealStageHistory.create({
        data: { dealId: id, stageId, movedBy: session.user.id },
      })
    }

    return NextResponse.json(deal)
  } catch (error) {
    console.error("PATCH /api/deals/[id] error:", error)
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
    const existing = await prisma.deal.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Deal não encontrado" }, { status: 404 })
    }

    await prisma.deal.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
