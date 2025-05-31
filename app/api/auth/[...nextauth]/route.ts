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
    updateAge: 60 * 60, // 1 hour
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
          console.log('[AUTH] No credentials provided');
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          })

          if (!user) {
            console.log('[AUTH] User not found:', credentials.email)
            return null
          }
          
          const isPasswordValid = await compare(credentials.password, user.password)

          if (!isPasswordValid) {
            console.log('[AUTH] Password invalid for:', user.email)
            return null
          }
          
          console.log('[AUTH] Login success for:', user.email)
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            memberId: user.memberId,
            role: user.role,
            status: user.status,
            profileImage: user.profileImage || null,
          }
        } catch (error) {
          console.error('[AUTH] Login error:', error)
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
        token.profileImage = user.profileImage || undefined;
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
        session.user.profileImage = token.profileImage || undefined;
      }
      
      return session
    },
    redirect: async ({ url, baseUrl }) => {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  events: {
    async signIn({ user }) {
      // Update last login time
      if (user?.email) {
        await prisma.user.update({
          where: { email: user.email },
          data: { lastLogin: new Date() },
        })
      }
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 