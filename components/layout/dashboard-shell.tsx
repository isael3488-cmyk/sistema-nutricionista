"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export function DashboardShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-[1800px]">
          <Sidebar
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <Header onMenuClick={() => setMobileMenuOpen(true)} />
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
