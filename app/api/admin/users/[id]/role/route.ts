import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { role } = await req.json()

    if (!["ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json({ error: "Role inválida" }, { status: 400 })
    }

    // Update role on User model directly
    await prisma.user.update({
      where: { id },
      data: { role: role as any }
    })

    // Also update UserRole for backward compatibility if it exists
    const userRole = await prisma.userRole.findFirst({ where: { userId: id } })
    if (userRole) {
      await prisma.userRole.update({
        where: { id: userRole.id },
        data: { role: role as any }
      })
    } else {
      await prisma.userRole.create({
        data: { userId: id, role: role as any }
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("PATCH /api/admin/users/[id]/role error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
