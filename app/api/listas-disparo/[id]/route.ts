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
    const { status, nome, descricao } = body

    const existing = await prisma.listaDisparo.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Lista não encontrada" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (nome) updateData.nome = nome
    if (descricao !== undefined) updateData.descricao = descricao

    // If starting the list, trigger the disparo webhook
    if (status === "EM_PROCESSAMENTO") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { disparoWebhookUrl: true },
      })

      if (user?.disparoWebhookUrl) {
        try {
          await fetch(user.disparoWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listaId: id, action: "start" }),
          })
        } catch {
          // Don't fail if webhook fails
        }
      }
    }

    // If canceling, trigger cancel webhook
    if (status === "CANCELADA") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { disparoCancelarWebhookUrl: true },
      })

      if (user?.disparoCancelarWebhookUrl) {
        try {
          await fetch(user.disparoCancelarWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listaId: id, action: "cancel" }),
          })
        } catch {
          // Don't fail if webhook fails
        }
      }
    }

    const lista = await prisma.listaDisparo.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(lista)
  } catch (error) {
    console.error("PATCH /api/listas-disparo/[id] error:", error)
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
    const existing = await prisma.listaDisparo.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Lista não encontrada" }, { status: 404 })
    }

    await prisma.listaDisparo.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
