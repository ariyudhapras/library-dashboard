import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import NextAuth from "next-auth/next"
import prisma from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Always fetch fresh data from the database
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          })

          if (!user) {
            return null
          }
          
          const isPasswordValid = await compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }
          
          // Return fresh user data with updated role
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            memberId: user.memberId,
            role: user.role,
            status: user.status,
          }
        } catch (error) {
          console.error("Login error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.memberId = user.memberId
        token.role = user.role
        token.status = user.status
      }
      
      return token
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.memberId = token.memberId as string
        session.user.role = token.role as string
        session.user.status = token.status as string
      }
      
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 