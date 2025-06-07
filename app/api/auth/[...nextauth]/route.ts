import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import NextAuth from "next-auth/next"
import { supabase } from "@/lib/supabase"; // Replaced prisma with supabase

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
          const { data: user, error: dbError } = await supabase
            .from('user')
            .select('*')
            .eq('email', credentials.email)
            .single();

          if (dbError) {
            console.error('[AUTH] Supabase error fetching user:', dbError.message);
            return null;
          }
          // Original Prisma code was here

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
          // Ensure user object structure is consistent, NextAuth User type expects id: number here
          return {
            id: user.id, // user.id from Supabase should be a number
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
        // Ensure token.id is a number. user.id from authorize callback should be a number.
        // If user.id is somehow a string here, attempt to parse it.
        token.id = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
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
        session.user.id = token.id as number; // JWT token.id is a number, session.user.id expects a number
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
        const { error: updateError } = await supabase
          .from('user')
          .update({ lastLogin: new Date() })
          .eq('email', user.email);

        if (updateError) {
          console.error('[AUTH] Supabase error updating lastLogin:', updateError.message);
          // Depending on requirements, you might not want to block sign-in for this.
        }
      }
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 