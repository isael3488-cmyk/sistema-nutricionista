"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/lib/navigation";

export function Sidebar({
  open,
  onClose,
}: Readonly<{
  open: boolean;
  onClose: () => void;
}>) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-950 text-slate-100 lg:flex lg:flex-col">
        <SidebarContent pathname={pathname} />
      </aside>

      <div
        className={`fixed inset-0 z-30 bg-slate-950/40 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-800 bg-slate-950 text-slate-100 shadow-2xl transition-transform lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent pathname={pathname} onNavigate={onClose} />
      </aside>
    </>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: Readonly<{
  pathname: string;
  onNavigate?: () => void;
}>) {
  return (
    <div className="flex h-full flex-col px-4 py-5">
      <div className="mb-8 flex items-center justify-between gap-3 px-2">
        <div>
          <div className="text-lg font-semibold text-white">NutriSaaS</div>
          <p className="text-sm text-slate-400">
            Operacao clinica simplificada
          </p>
        </div>

        {onNavigate ? (
          <button
            type="button"
            onClick={onNavigate}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white"
            aria-label="Fechar menu"
          >
            <span className="text-xl leading-none">X</span>
          </button>
        ) : null}
      </div>

      <nav className="space-y-1">
        {navigationItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-white text-slate-950 shadow-lg shadow-slate-950/20"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
                  active ? "bg-slate-950/5" : "bg-white/5"
                }`}
              >
                <item.icon active={active} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-medium text-white">Fase 1 concluida</p>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          Estrutura visual, rotas principais e shell responsivo ja preparados.
        </p>
      </div>
    </div>
  );
}
