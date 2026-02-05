import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            profile: true,
          },
        })

        if (!user) {
          throw new Error('Invalid email or password')
        }

        if (user.status === 'PENDING') {
          throw new Error('Your account is pending approval')
        }

        if (user.status === 'REJECTED') {
          throw new Error('Your account has been rejected')
        }

        if (user.status === 'DISABLED') {
          throw new Error('Your account has been disabled')
        }

        const isPasswordValid = await verifyPassword(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.fullName || user.email,
          role: user.role,
          userType: user.userType,
          status: user.status,
          isLoanEligible: user.isLoanEligible,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.userType = user.userType
        token.status = user.status
        token.isLoanEligible = user.isLoanEligible
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.userType = token.userType as string
        session.user.status = token.status as string
        session.user.isLoanEligible = token.isLoanEligible as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
