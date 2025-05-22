"use client"

import { useSession } from "next-auth/react"
import Head from "next/head"

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
} 