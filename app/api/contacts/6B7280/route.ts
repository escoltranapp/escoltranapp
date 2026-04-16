import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const contact = await prisma.contact.update({
      where: { id },
      data: {
        nome: body.nome,
        empresa: body.empresa,
        email: body.email,
        telefone: body.telefone,
        cargo: body.cargo,
        canalOrigem: body.canalOrigem,
        tags: body.tags,
        status: body.status,
        notas: body.notas
      }
    })
    
    return NextResponse.json(contact)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar contato' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.contact.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir contato' }, { status: 500 })
  }
}
