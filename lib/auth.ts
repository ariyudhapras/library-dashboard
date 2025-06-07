import NextAuth, { NextAuthOptions, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login-user",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { data: user, error: userError } = await supabase
          .from('user') // Assuming your table is named 'user'
          .select('*') // Or specify required fields: 'id, name, email, role, memberId, password'
          .eq('email', credentials.email)
          .single();

        if (userError) {
          console.error('Error fetching user from Supabase:', userError.message);
          return null;
        }

        if (user && user.password && await bcrypt.compare(credentials.password, user.password)) {
          // Ensure emailVerified is handled if your logic requires it
          // For example, if you have a user.emailVerified field:
          // if (!user.emailVerified) {
          //   throw new Error("Email not verified");
          // }
          // Return id as number, as per error: "Type 'string' is not assignable to type 'number'" for User.id
          return {
            id: user.id, // user.id from Supabase is a number
            name: user.name,
            email: user.email,
            role: user.role,
            memberId: user.memberId,
            status: user.status,
            profileImage: user.profileImage || null
          };
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: any; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.sub; // Use token.sub for user id in session
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role as string; // Cast if you are sure about the type
        session.user.memberId = token.memberId as string;
        session.user.status = token.status as string;
        session.user.profileImage = token.profileImage as string | null;
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      // Initial sign in: user is the object from authorize callback
      if (user && user.id) { // user.id from authorize is a number
        token.sub = String(user.id); // Standard JWT subject claim (string)
        token.id = user.id;          // Custom property on token, must be number as per error
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.memberId = user.memberId;
        token.status = user.status;
        token.profileImage = user.profileImage;
      }
      // Subsequent calls, token exists, user object is not passed.
      // The token already has the necessary information.
      return token;
    },
  },
}; 