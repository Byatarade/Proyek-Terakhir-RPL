"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/organisms/Sidebar";
import { TopBar } from "@/components/organisms/TopBar";
import { UserRole } from "@/lib/types/database";

export interface DashboardShellProps {
  children: React.ReactNode;
  storeName: string;
  storeSlug: string;
  isOpen: boolean;
  fullName: string;
  role: UserRole;
}

export function DashboardShell({
  children,
  storeName,
  storeSlug,
  isOpen,
  fullName,
  role,
}: DashboardShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // Default menyusut (collapsed) khusus pada desktop saat membuka dashboard
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  // Deteksi ukuran layar desktop (lg: >= 1024px)
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  // Muat preferensi pengguna dari localStorage jika sebelumnya pernah diubah
  useEffect(() => {
    try {
      const saved = localStorage.getItem("paybuy_sidebar_collapsed");
      if (saved !== null) {
        requestAnimationFrame(() => {
          setIsCollapsed(saved === "true");
        });
      }
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }, []);

  const handleToggleCollapse = () => {
    // Fitur susutkan/perbesar hanya berlaku pada layar desktop
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;

    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("paybuy_sidebar_collapsed", String(next));
      } catch {
        // Abaikan jika localStorage tidak tersedia
      }
      return next;
    });
  };

  // Efek susutkan hanya aktif di desktop (lebar layar >= 1024px)
  const effectiveCollapsed = isDesktop && isCollapsed;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar Navigation */}
      <Sidebar
        role={role}
        storeName={storeName}
        storeSlug={storeSlug}
        fullName={fullName}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        isCollapsed={effectiveCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white transition-all duration-300">
        {/* TopBar with Store Info, Desktop Collapse Toggle & Logout */}
        <TopBar
          storeName={storeName}
          storeSlug={storeSlug}
          isOpen={isOpen}
          fullName={fullName}
          role={role}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
          isCollapsed={effectiveCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Page Content */}
        <main
          className={
            effectiveCollapsed
              ? "flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto bg-white transition-all duration-300"
              : "flex-1 p-4 sm:p-6 lg:p-8 max-w-[1280px] w-full mx-auto bg-white transition-all duration-300"
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}

