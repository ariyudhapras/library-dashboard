"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User } from "lucide-react"

export function AvatarDropdown() {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="w-16 h-16 cursor-pointer text-2xl">
          {user?.profileImage ? (
            <AvatarImage src={user.profileImage} alt={user.name || "User"} />
          ) : null}
          <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="font-semibold text-base">{user?.name || "User"}</span>
          <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/user/profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profil Saya
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-700 flex items-center gap-2"
          onClick={() => signOut({ callbackUrl: "/login-user" })}
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AvatarDropdown; 