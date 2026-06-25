"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PatientAnamnesis,
  PatientAnamnesisFormValues,
  createAnamnesis,
  emptyPatientAnamnesis,
} from "@/lib/patients";
import {
  deletePatientAnamnesis,
  getPatientAnamnesis,
  upsertPatientAnamnesis,
} from "@/lib/supabase/repositories";

export function usePatientAnamnesis(patientId: string) {
  const [anamnesis, setAnamnesis] = useState<PatientAnamnesis | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setAnamnesis(null);
      setError(null);
      setReady(true);
      return;
    }

    let mounted = true;

    async function loadAnamnesis() {
      setReady(false);
      setError(null);

      try {
        const record = await getPatientAnamnesis(patientId);
        if (mounted) {
          setAnamnesis(record);
        }
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Falha ao carregar anamnese.",
          );
        }
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    }

    void loadAnamnesis();

    return () => {
      mounted = false;
    };
  }, [patientId]);

  const actions = useMemo(
    () => ({
      async saveAnamnesis(values: PatientAnamnesisFormValues) {
        const saved = await upsertPatientAnamnesis(
          patientId,
          createAnamnesis(values),
        );
        setAnamnesis(saved);
      },
      async clearAnamnesis() {
        await deletePatientAnamnesis(patientId);
        setAnamnesis(null);
      },
      getDefaultValues() {
        return anamnesis ?? emptyPatientAnamnesis;
      },
    }),
    [anamnesis, patientId],
  );

  return {
    ready,
    anamnesis,
    error,
    ...actions,
  };
}
