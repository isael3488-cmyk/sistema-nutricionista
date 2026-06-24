"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createAppointment,
  type Appointment,
  type AppointmentFormValues,
} from "@/lib/appointments";
import {
  deleteAppointment as deleteAppointmentRecord,
  insertAppointment,
  listAppointments,
  updateAppointment as updateAppointmentRecord,
} from "@/lib/supabase/repositories";

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useMemo(
    () => async () => {
      setReady(false);
      setError(null);

      try {
        const records = await listAppointments();
        setAppointments(records);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Falha ao carregar consultas do Supabase.",
        );
      } finally {
        setReady(true);
      }
    },
    [],
  );

  useEffect(() => {
    let mounted = true;

    async function loadAppointments() {
      await refresh();
      if (!mounted) {
        return;
      }
    }

    void loadAppointments();

    return () => {
      mounted = false;
    };
  }, [refresh]);

  const actions = useMemo(
    () => ({
      async addAppointment(values: AppointmentFormValues) {
        const created = await insertAppointment(createAppointment(values));
        setAppointments((current) => [
          created,
          ...current.filter((appointment) => appointment.id !== created.id),
        ]);
      },
      async updateAppointment(appointment: Appointment) {
        const updated = await updateAppointmentRecord(appointment);
        setAppointments((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      },
      async deleteAppointment(appointmentId: string) {
        await deleteAppointmentRecord(appointmentId);
        setAppointments((current) =>
          current.filter((appointment) => appointment.id !== appointmentId),
        );
      },
      refresh,
    }),
    [refresh],
  );

  return {
    appointments,
    ready,
    error,
    ...actions,
  };
}
