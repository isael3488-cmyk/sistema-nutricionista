"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type MealPlan,
  type MealPlanFormValues,
  emptyMealPlanFormValues,
  mealSlots,
  createMealPlan,
} from "@/lib/patients";
import {
  deletePatientMealPlan,
  getPatientMealPlan,
  upsertPatientMealPlan,
} from "@/lib/supabase/repositories";

export function usePatientMealPlan(patientId: string) {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setMealPlan(null);
      setError(null);
      setReady(true);
      return;
    }

    let mounted = true;

    async function loadMealPlan() {
      setReady(false);
      setError(null);

      try {
        const record = await getPatientMealPlan(patientId);
        if (mounted) {
          setMealPlan(record);
        }
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Falha ao carregar plano alimentar.",
          );
        }
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    }

    void loadMealPlan();

    return () => {
      mounted = false;
    };
  }, [patientId]);

  const actions = useMemo(
    () => ({
      async saveMealPlan(values: MealPlanFormValues) {
        const nextMealPlan = createMealPlan(patientId, values);
        const saved = await upsertPatientMealPlan(nextMealPlan);
        setMealPlan(saved);
      },
      async clearMealPlan() {
        await deletePatientMealPlan(patientId);
        setMealPlan(null);
      },
      getDefaultValues(): MealPlanFormValues {
        return mealPlan
          ? convertMealPlanToFormValues(mealPlan)
          : emptyMealPlanFormValues;
      },
    }),
    [mealPlan, patientId],
  );

  return {
    ready,
    mealPlan,
    error,
    ...actions,
  };
}

function convertMealPlanToFormValues(mealPlan: MealPlan): MealPlanFormValues {
  return mealSlots.reduce((acc, slot) => {
    acc[slot] = mealPlan.meals[slot].map(({ id, ...item }) => {
      void id;
      return item;
    });
    return acc;
  }, { ...emptyMealPlanFormValues });
}
