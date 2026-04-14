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

          const role = user.userRoles[0]?.role || 'user'
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
        token.role = (user as { role?: string }).role || 'user'
        token.teamId = (user as { teamId?: string | null }).teamId || null
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.teamId = token.teamId as string | null
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
