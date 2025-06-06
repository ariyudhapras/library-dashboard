"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MailQuestion,
  ArchiveRestore,
  FileText,
  Home,
  LibraryBig,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { usePathname } from "next/navigation";
import React from "react";

interface AdminSidebarContentProps {
  user?: {
    name?: string | null;
    role?: string;
  };
  activePath?: string;
  onNavClick?: () => void;
  firstMenuRef?: React.RefObject<HTMLAnchorElement>;
}

export function AdminSidebarContent({
  user,
  activePath,
  onNavClick,
  firstMenuRef,
}: AdminSidebarContentProps) {
  const pathname = activePath || usePathname();
  const menu = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5 lg:w-7 lg:h-7" />,
    },
    {
      href: "/admin/books",
      label: "Manajemen Buku",
      icon: <BookOpen className="w-5 h-5 lg:w-7 lg:h-7" />,
    },
    {
      href: "/admin/members",
      label: "Manajemen Anggota",
      icon: <Users className="w-5 h-5 lg:w-7 lg:h-7" />,
    },
    {
      href: "/admin/requests",
      label: "Permintaan Peminjaman",
      icon: <MailQuestion className="w-5 h-5 lg:w-7 lg:h-7" />,
    },
    {
      href: "/admin/returns",
      label: "Pengembalian",
      icon: <ArchiveRestore className="w-5 h-5 lg:w-7 lg:h-7" />,
    },
    {
      href: "/admin/reports",
      label: "Laporan",
      icon: <FileText className="w-5 h-5 lg:w-7 lg:h-7" />,
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-2 items-center py-8 border-b border-[#23263A] mb-4">
        <span className="inline-block align-middle rounded-full bg-white p-1 shadow-md">
          <LibraryBig className="w-10 h-10 lg:w-12 lg:h-12 text-blue-600" />
        </span>
        <h2 className="text-2xl lg:text-4xl font-extrabold tracking-tight text-white">
          Admin Panel
        </h2>
        <p className="text-sm lg:text-lg text-[#A0AEC0] lg:mt-1">
          Perpustakaan Digital
        </p>
      </div>
      {/* Menu */}
      <nav className="space-y-1 px-3">
        {menu.map((item, idx) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            ref={idx === 0 && firstMenuRef ? firstMenuRef : undefined}
            tabIndex={idx === 0 && firstMenuRef ? 0 : undefined}
            className={`flex items-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-base lg:text-xl gap-4 cursor-pointer select-none
              ${
                pathname === item.href
                  ? "bg-[#23263A] text-white border-l-4 border-[#2563eb] shadow-sm"
                  : "text-[#A0AEC0] hover:bg-[#23263A] hover:text-white hover:border-l-4 hover:border-[#2563eb]"
              }
            `}
            style={{ minHeight: 48 }}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
        <div className="pt-4 mt-4 border-t border-[#23263A]">
          <LogoutButton
            variant="ghost"
            className="flex items-center px-4 py-3 text-red-400 rounded-lg hover:bg-red-900/20 hover:text-red-200 w-full text-left transition-all duration-200 font-medium gap-3"
          />
        </div>
      </nav>
    </>
  );
}
