import { PatientShell } from "@/components/patient-portal/patient-shell";
import type { ReactNode } from "react";

export default function PatientLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <PatientShell>{children}</PatientShell>;
}
