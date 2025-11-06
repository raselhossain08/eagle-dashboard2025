"use client";

import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <DashboardHeader onToggleSidebar={toggleSidebar} />

      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar
          mobileMenuOpen={isSidebarOpen}
          onMobileMenuClose={closeSidebar}
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pt-6 pb-8 transition-all duration-300">
          <div className="mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}