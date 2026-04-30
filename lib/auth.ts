import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            include: {
              userRoles: true,
              teamMembers: {
                include: { team: true },
              },
            },
          })

          if (!user || !user.password) {
            return null
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isValid) {
            return null
          }

          const role = user.role || 'MEMBER'
          const teamId = user.teamMembers[0]?.teamId || null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role,
            teamId,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || 'MEMBER'
        token.teamId = (user as any).teamId || null

        // Fetch permissions for the token
        const permissions = await prisma.modulePermission.findMany({
          where: { userId: user.id as string }
        })
        token.permissions = permissions.map(p => ({
          module: p.moduleName,
          level: p.level
        }))
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.teamId = token.teamId as string | null
        session.user.permissions = token.permissions as any[]
      }
      return session
    },
  },
})

export async function getTeamUserIds(userId: string): Promise<string[]> {
  try {
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId },
      include: {
        team: {
          include: {
            members: true,
          },
        },
      },
    })

    if (!teamMember?.team) {
      return [userId]
    }

    return teamMember.team.members.map((m) => m.userId)
  } catch {
    return [userId]
  }
}

export async function hasPermission(userId: string, module: string, requiredLevel: 'VIEW' | 'EDIT' | 'FULL'): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { modulePermissions: true }
  })

  if (!user) return false
  if (user.role === 'ADMIN') return true

  const perm = user.modulePermissions.find(p => p.moduleName === module)
  if (!perm) return false

  const levels = ['NONE', 'VIEW', 'EDIT', 'FULL']
  const userLevelIdx = levels.indexOf(perm.level)
  const requiredLevelIdx = levels.indexOf(requiredLevel)

  return userLevelIdx >= requiredLevelIdx
}
