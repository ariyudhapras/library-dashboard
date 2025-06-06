"use client";

import "../globals.css";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MailQuestion,
  ArchiveRestore,
  FileText,
  Home,
  LogOut,
  LibraryBig
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebarContent } from "@/components/ui/AdminSidebarContent";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    redirect("/login");
  }

  const isActive = (path: string) => pathname === path;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-100">
        {/* Sidebar as flex item */}
        <Sidebar
          className="w-[22rem] min-h-screen bg-[#181C2A] p-0 border-r border-[#23263A] shadow-lg hidden lg:block"
          collapsible="offcanvas"
          side="left"
        >
          <AdminSidebarContent user={session?.user} activePath={pathname} />
        </Sidebar>
        {/* Main Content */}
        <SidebarInset>
          <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 xl:px-12 py-8">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
