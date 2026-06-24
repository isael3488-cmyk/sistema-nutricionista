"use client";

import Link from "next/link";

export function Header({
  onMenuClick,
}: Readonly<{
  onMenuClick: () => void;
}>) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
          aria-label="Abrir menu"
        >
          <span className="flex flex-col gap-1.5">
            <span className="h-0.5 w-4 rounded-full bg-current" />
            <span className="h-0.5 w-4 rounded-full bg-current" />
            <span className="h-0.5 w-4 rounded-full bg-current" />
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-500">
            Sistema Nutricionista
          </p>
          <h1 className="truncate text-base font-semibold text-slate-900">
            Plataforma SaaS para nutricionistas
          </h1>
        </div>

        <div className="hidden max-w-md flex-1 lg:block">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Estrutura inicial pronta
          </div>
        </div>

        <Link
          href="/settings"
          className="inline-flex h-10 items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Perfil
        </Link>
      </div>
    </header>
  );
}
