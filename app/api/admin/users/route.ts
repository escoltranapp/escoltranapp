import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        userRoles: {
          select: {
            role: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const formattedUsers = users.map(u => ({
      ...u,
      role: u.userRoles[0]?.role || "user"
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
