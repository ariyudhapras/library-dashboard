"use client";

import "../globals.css";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  User,
  BookOpen,
  Clock,
  Home,
  Book,
  LibraryBig,
  BookMarked,
  Menu,
  Heart,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { UserSidebarContent } from "@/components/ui/UserSidebarContent";
import { AvatarDropdown } from "@/components/ui/AvatarDropdown";

export const dynamic = "force-dynamic";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const firstMenuRef = useRef<HTMLAnchorElement>(null);

  // Lock scroll and overflow-x-hidden on body saat menu terbuka
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("overflow-hidden", "overflow-x-hidden");
    } else {
      document.body.classList.remove("overflow-hidden", "overflow-x-hidden");
    }
    return () =>
      document.body.classList.remove("overflow-hidden", "overflow-x-hidden");
  }, [isMobileMenuOpen]);

  // Fokus ke menu pertama saat menu terbuka, kembalikan ke hamburger saat tutup
  useEffect(() => {
    if (isMobileMenuOpen) {
      setTimeout(() => {
        firstMenuRef.current?.focus();
      }, 50);
    } else {
      hamburgerRef.current?.focus();
    }
  }, [isMobileMenuOpen]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const handleNavClick = () => setIsMobileMenuOpen(false);

  // Avatar fallback
  const userInitial = session?.user?.name?.[0]?.toUpperCase() || "U";
  const avatarUrl = session?.user?.profileImage || undefined;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-100">
        {/* Sticky Mobile Header (only for mobile) */}
        <header className="lg:hidden sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-gray-200 flex items-center justify-between px-4 h-14 shadow-sm">
          <button
            ref={hamburgerRef}
            aria-label="Buka menu navigasi"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center justify-center min-w-[40px] min-h-[40px] rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Menu className="h-7 w-7 text-primary-700" />
          </button>
          <span className="text-lg font-bold tracking-tight text-primary-700">
            Digital Library
          </span>
          {/* Real Profile Button from AvatarDropdown */}
          <div className="flex items-center min-w-[40px] min-h-[40px]">
            <AvatarDropdown />
          </div>
        </header>
        {/* Sidebar (desktop) */}
        <Sidebar
          className="w-[22rem] min-h-screen bg-[#181C2A] p-0 border-r border-[#23263A] shadow-lg hidden lg:block"
          collapsible="offcanvas"
          side="left"
        >
          <UserSidebarContent user={session?.user} activePath={pathname} />
        </Sidebar>
        {/* Sidebar as Drawer (mobile) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/40"
              aria-hidden="true"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer Sidebar */}
            <aside
              className="absolute left-0 top-0 h-full w-64 bg-[#181C2A] border-r border-[#23263A] shadow-lg flex flex-col"
              role="dialog"
              aria-modal="true"
            >
              <UserSidebarContent
                user={session?.user}
                activePath={pathname}
                onNavClick={handleNavClick}
                firstMenuRef={firstMenuRef}
              />
            </aside>
          </div>
        )}
        {/* Main Content */}
        <SidebarInset>
          <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 xl:px-12 py-8">
            {children}
            <Toaster
              position="top-center"
              richColors
              closeButton
              duration={3000}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
