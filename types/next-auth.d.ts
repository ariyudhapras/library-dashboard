import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number; // ✅ gunakan number
      name: string;
      email: string;
      memberId: string;
      role: string;
      status: string;
      profileImage?: string;
      address?: string;
      phone?: string;
      birthDate?: string;
      createdAt?: string;
    };
  }

  interface User {
    id: number; // ✅ gunakan number
    name: string;
    email: string;
    memberId: string;
    role: string;
    status: string;
    profileImage?: string;
    address?: string;
    phone?: string;
    birthDate?: string;
    createdAt?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number; // ✅ gunakan number
    name: string;
    email: string;
    memberId: string;
    role: string;
    status: string;
    profileImage?: string;
    address?: string;
    phone?: string;
    birthDate?: string;
    createdAt?: string;
  }
}
