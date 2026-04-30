import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { role } = await req.json()

    if (!["admin", "manager", "user"].includes(role)) {
      return NextResponse.json({ error: "Role inválida" }, { status: 400 })
    }

    // Update or create role
    await prisma.userRole.upsert({
      where: { id: (await prisma.userRole.findFirst({ where: { userId: id } }))?.id || "new" },
      update: { role },
      create: { userId: id, role }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("PATCH /api/admin/users/[id]/role error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
