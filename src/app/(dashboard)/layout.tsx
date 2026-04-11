"use client";

import { AppDataProvider } from "@/lib/data-context";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppDataProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="lg:pl-64">
          <div className="px-4 py-4 sm:px-6 lg:px-8 pt-14 lg:pt-4 pb-20 lg:pb-4 max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AppDataProvider>
  );
}
