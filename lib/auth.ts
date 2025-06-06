import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  // @ts-expect-error // @auth/core adapter vs next-auth v4 adapter type mismatch (see lint ID 877d251a...)
  // This error is due to type incompatibilities between next-auth@4.x.x and @auth/prisma-adapter which uses a newer @auth/core.
  // PrismaAdapter expects/produces an AdapterUser that doesn't perfectly match what next-auth v4's Adapter type expects.
  // Specifically, fields like emailVerified, and potentially how other fields are typed/handled differ.
  // Our Prisma schema also lacks emailVerified, which PrismaAdapter typically expects or tries to map.
  adapter: PrismaAdapter(prisma),
  adapter: PrismaAdapter(prisma),
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

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id, // Prisma user.id is Int
          email: user.email,
          name: user.name,
          role: user.role,
          profileImage: user.profileImage,
          memberId: user.memberId, // Added from Prisma User model
          status: user.status,     // Added from Prisma User model
        };
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id as number; // token.id is number from JWT interface
        session.user.name = token.name; // name is string | null | undefined from JWT
        session.user.email = token.email; // email is string | null | undefined from JWT
        session.user.role = token.role as string; // role is string from JWT
        session.user.profileImage = token.profileImage; // profileImage is string | null | undefined from JWT
        session.user.memberId = token.memberId as string; // Added, assuming memberId is on token
        session.user.status = token.status as string;   // Added, assuming status is on token
      }
      return session;
    },
    async jwt({ token, user }) {
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email!,
        },
      });

      const augmentedUser = user as User; // Cast user to our augmented User type

      // This block runs on initial sign-in or when JWT is created/refreshed
      if (augmentedUser) {
        token.id = augmentedUser.id;
        token.name = augmentedUser.name;
        token.email = augmentedUser.email;
        token.role = augmentedUser.role;
        token.profileImage = augmentedUser.profileImage;
        token.memberId = augmentedUser.memberId; // Added
        token.status = augmentedUser.status;     // Added
      }

      // If dbUser is found (e.g., on subsequent JWT creations not from initial sign-in),
      // this could be used to refresh token with latest db info.
      // However, the primary update should happen via `augmentedUser` from authorize/OAuth.
      // This block ensures that if a token is somehow generated *not* through the initial user flow
      // but a dbUser is available, it's used. It also merges essential JWT fields.
      if (dbUser) {
        // Preserve essential JWT fields from the old token if they exist
        const { iat, exp, jti, sub } = token;
        const newToken: JWT = {
          ...sub && { sub }, // Keep original subject if present
          ...iat && { iat },
          ...exp && { exp },
          ...jti && { jti },
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          profileImage: dbUser.profileImage || null,
          memberId: dbUser.memberId, // Added
          status: dbUser.status,     // Added
        };
        return newToken;
      }
      return token; // Return the (potentially updated) token
    },
  },
}; 