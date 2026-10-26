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
  // Default menyusut (collapsed) pada desktop saat membuka dashboard
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Muat preferensi pengguna dari localStorage jika sebelumnya pernah diubah
  useEffect(() => {
    try {
      const saved = localStorage.getItem("paybuy_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }, []);

  const handleToggleCollapse = () => {
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
        isCollapsed={isCollapsed}
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
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Page Content */}
        <main
          className={
            isCollapsed
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

