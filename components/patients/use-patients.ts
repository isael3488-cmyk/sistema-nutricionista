"use client";

import { useEffect, useMemo, useState } from "react";
import { Patient, PatientFormValues, createPatient } from "@/lib/patients";
import {
  deletePatient as deletePatientRecord,
  listPatients,
  upsertPatient as savePatientRecord,
} from "@/lib/supabase/repositories";

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useMemo(
    () => async () => {
      setReady(false);
      setError(null);

      try {
        const records = await listPatients();
        setPatients(records);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Falha ao carregar pacientes do Supabase.",
        );
      } finally {
        setReady(true);
      }
    },
    [],
  );

  useEffect(() => {
    let mounted = true;

    async function loadPatients() {
      await refresh();
      if (!mounted) {
        return;
      }
    }

    void loadPatients();

    return () => {
      mounted = false;
    };
  }, [refresh]);

  const actions = useMemo(
    () => ({
      async addPatient(values: PatientFormValues) {
        const created = await savePatientRecord(createPatient(values));
        setPatients((current) => [
          created,
          ...current.filter((patient) => patient.id !== created.id),
        ]);
      },
      async upsertPatient(patient: Patient) {
        const saved = await savePatientRecord(patient);
        setPatients((current) => [
          saved,
          ...current.filter((item) => item.id !== saved.id),
        ]);
      },
      async updatePatient(patient: Patient) {
        const updated = await savePatientRecord(patient);
        setPatients((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      },
      async deletePatient(patientId: string) {
        await deletePatientRecord(patientId);
        setPatients((current) =>
          current.filter((patient) => patient.id !== patientId),
        );
      },
      getPatientById(id: string) {
        return patients.find((patient) => patient.id === id) ?? null;
      },
      getPatientByUserId(userId: string) {
        return patients.find((patient) => patient.userId === userId) ?? null;
      },
      refresh,
    }),
    [patients, refresh],
  );

  return {
    patients,
    ready,
    error,
    ...actions,
  };
}
