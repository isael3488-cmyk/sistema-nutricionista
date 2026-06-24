type NavIconProps = {
  active?: boolean;
};

const iconClass = (active?: boolean) =>
  active ? "text-slate-950" : "text-slate-300";

function DashboardIcon({ active }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-5 w-5 ${iconClass(active)}`}
      aria-hidden="true"
    >
      <path d="M4 13.5h6v6H4z" />
      <path d="M14 4h6v6h-6z" />
      <path d="M14 13.5h6v6h-6z" />
      <path d="M4 4h6v6H4z" />
    </svg>
  );
}

function PatientsIcon({ active }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-5 w-5 ${iconClass(active)}`}
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7.5" r="3.5" />
      <path d="M17 11a3 3 0 1 0-2.8-4" />
    </svg>
  );
}

function CalendarIcon({ active }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-5 w-5 ${iconClass(active)}`}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function PlanIcon({ active }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-5 w-5 ${iconClass(active)}`}
      aria-hidden="true"
    >
      <path d="M7 4h10a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2z" />
      <path d="M9 9h6M9 13h6" />
    </svg>
  );
}

function ReportsIcon({ active }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-5 w-5 ${iconClass(active)}`}
      aria-hidden="true"
    >
      <path d="M4 19h16" />
      <path d="M6 17V9" />
      <path d="M12 17V5" />
      <path d="M18 17v-8" />
    </svg>
  );
}

function SettingsIcon({ active }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-5 w-5 ${iconClass(active)}`}
      aria-hidden="true"
    >
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.05.05a2 2 0 1 1-2.83 2.83l-.05-.05A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.56V21a2 2 0 1 1-4 0v-.04a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.87.34l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1H3a2 2 0 1 1 0-4h.04A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.04a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.05-.05a2 2 0 1 1 2.83 2.83l-.05.05A1.7 1.7 0 0 0 19.4 9c.73 0 1.38.44 1.66 1.1.11.26.18.56.18.9s-.07.64-.18.9a1.8 1.8 0 0 1-1.66 1.1H19a1.7 1.7 0 0 0-1.56 1z" />
    </svg>
  );
}

export const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/patients", label: "Pacientes", icon: PatientsIcon },
  { href: "/appointments", label: "Consultas", icon: CalendarIcon },
  { href: "/nutrition-plans", label: "Planos", icon: PlanIcon },
  { href: "/reports", label: "Relatorios", icon: ReportsIcon },
  { href: "/settings", label: "Configuracoes", icon: SettingsIcon },
] as const;

