import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: number;
      name?: string | null;
      email?: string | null;
      image?: string | null; // Default field from NextAuth
      role: string;
      profileImage?: string | null; // Custom field
      memberId: string; // Added from Prisma User
      status: string; // Added from Prisma User
    };
    expires: DefaultSession["expires"]; // Keep expires from DefaultSession
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    id: number; // Prisma User ID is Int
    role: string;
    profileImage?: string | null;
    memberId: string; // Added from Prisma User
    status: string; // Added from Prisma User
    // emailVerified is not present in the Prisma schema for User
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    id: number;
    role: string;
    profileImage?: string | null;
  }
}
