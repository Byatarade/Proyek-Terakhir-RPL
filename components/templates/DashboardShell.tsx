"use client";

import React, { useState } from "react";
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

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar Navigation */}
      <Sidebar
        role={role}
        storeName={storeName}
        storeSlug={storeSlug}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* TopBar with Store Info & Logout */}
        <TopBar
          storeName={storeName}
          storeSlug={storeSlug}
          isOpen={isOpen}
          fullName={fullName}
          role={role}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1280px] w-full mx-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
