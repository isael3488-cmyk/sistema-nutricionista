import { PatientDetailsScreen } from "@/components/patients/patient-details-screen";

export default async function PatientDetailsPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  return <PatientDetailsScreen patientId={id} />;
}
