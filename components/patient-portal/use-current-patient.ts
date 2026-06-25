"use client";

import { useEffect, useMemo, useState } from "react";
import { usePatients } from "@/components/patients/use-patients";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Patient } from "@/lib/patients";

export function useCurrentPatient() {
  const { getPatientByUserId, upsertPatient, ready: patientsReady } = usePatients();
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.auth.getUser();

        if (!mounted) {
          return;
        }

        if (error || !data.user) {
          setUserError(error?.message ?? "Nao foi possivel identificar o usuario.");
          return;
        }

        setUserId(data.user.id);
      } catch (loadError) {
        if (mounted) {
          setUserError(
            loadError instanceof Error
              ? loadError.message
              : "Nao foi possivel carregar o usuario atual.",
          );
        }
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    }

    void loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const patient = useMemo<Patient | null>(() => {
    if (!userId) {
      return null;
    }

    return getPatientByUserId(userId);
  }, [getPatientByUserId, userId]);

  return {
    userId,
    patient,
    patientsReady,
    loadingUser,
    userError,
    upsertPatient,
  };
}
