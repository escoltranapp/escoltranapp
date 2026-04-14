import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const contact = await prisma.contact.findFirst({
      where: { id, userId: session.user.id },
      include: {
        deals: {
          orderBy: { createdAt: "desc" },
          include: { stage: true },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { deals: true, activities: true } },
      },
    })

    if (!contact) {
      return NextResponse.json({ error: "Contato não encontrado" }, { status: 404 })
    }

    return NextResponse.json(contact)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

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

    const existing = await prisma.contact.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Contato não encontrado" }, { status: 404 })
    }

    const {
      nome, sobrenome, email, telefone, empresa, cargo,
      status, etapaFunil, canalOrigem, tags, lgpdConsent,
      documento, camposCustom,
    } = body

    const updateData: Record<string, unknown> = {}
    if (nome !== undefined) updateData.nome = nome
    if (sobrenome !== undefined) updateData.sobrenome = sobrenome
    if (email !== undefined) updateData.email = email
    if (telefone !== undefined) updateData.telefone = telefone
    if (empresa !== undefined) updateData.empresa = empresa
    if (cargo !== undefined) updateData.cargo = cargo
    if (status !== undefined) updateData.status = status
    if (etapaFunil !== undefined) updateData.etapaFunil = etapaFunil
    if (canalOrigem !== undefined) updateData.canalOrigem = canalOrigem
    if (tags !== undefined) updateData.tags = tags
    if (lgpdConsent !== undefined) updateData.lgpdConsent = lgpdConsent
    if (documento !== undefined) updateData.documento = documento
    if (camposCustom !== undefined) updateData.camposCustom = camposCustom

    const contact = await prisma.contact.update({
      where: { id },
      data: updateData,
      include: { _count: { select: { deals: true } } },
    })

    return NextResponse.json(contact)
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
    const existing = await prisma.contact.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Contato não encontrado" }, { status: 404 })
    }

    await prisma.contact.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
