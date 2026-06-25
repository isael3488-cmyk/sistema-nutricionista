"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function PatientShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AuthGuard requiredRole="patient">
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto min-h-screen max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
            <PatientTopbar />
            <main className="p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

function PatientTopbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);

    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
            Area do paciente
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Seu acompanhamento nutricional
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Acesse suas métricas, dieta, evolucao e escolha do plano.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <NavButton
            active={pathname === "/patient"}
            onClick={() => router.push("/patient")}
          >
            Painel
          </NavButton>
          <NavButton
            active={pathname === "/patient/profile"}
            onClick={() => router.push("/patient/profile")}
          >
            Perfil
          </NavButton>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex h-10 items-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      </div>
    </header>
  );
}

function NavButton({
  active,
  onClick,
  children,
}: Readonly<{
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center rounded-2xl border px-4 text-sm font-medium transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
