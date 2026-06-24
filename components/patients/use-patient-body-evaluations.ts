"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PatientBodyEvaluation,
  PatientBodyEvaluationFormValues,
  createBodyEvaluation,
} from "@/lib/patients";
import {
  deletePatientBodyEvaluation,
  insertPatientBodyEvaluation,
  listPatientBodyEvaluations,
} from "@/lib/supabase/repositories";

export function usePatientBodyEvaluations(patientId: string) {
  const [evaluations, setEvaluations] = useState<PatientBodyEvaluation[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadEvaluations() {
      setReady(false);
      setError(null);

      try {
        const records = await listPatientBodyEvaluations(patientId);
        if (mounted) {
          setEvaluations(records);
        }
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Falha ao carregar avaliacoes.",
          );
        }
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    }

    void loadEvaluations();

    return () => {
      mounted = false;
    };
  }, [patientId]);

  const actions = useMemo(
    () => ({
      async saveEvaluation(values: PatientBodyEvaluationFormValues) {
        const nextEvaluation = createBodyEvaluation(patientId, values);
        const saved = await insertPatientBodyEvaluation(nextEvaluation);
        setEvaluations((current) =>
          [saved, ...current.filter((item) => item.id !== saved.id)].sort(
            (a, b) =>
              new Date(b.evaluationDate).getTime() -
              new Date(a.evaluationDate).getTime(),
          ),
        );
      },
      async deleteEvaluation(evaluationId: string) {
        await deletePatientBodyEvaluation(evaluationId);
        setEvaluations((current) =>
          current.filter((evaluation) => evaluation.id !== evaluationId),
        );
      },
      getLatestEvaluation() {
        return evaluations[0] ?? null;
      },
    }),
    [evaluations, patientId],
  );

  return {
    ready,
    evaluations,
    error,
    ...actions,
  };
}
