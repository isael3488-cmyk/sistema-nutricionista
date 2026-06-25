"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getRoleFallbackRoute,
  getUserRole,
  type UserRole,
} from "@/lib/auth";

type AuthGuardProps = {
  children: ReactNode;
  requiredRole?: UserRole;
};

export function AuthGuard({ children, requiredRole }: Readonly<AuthGuardProps>) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    try {
      const supabase = getSupabaseBrowserClient();

      void supabase.auth.getUser().then(({ data, error }) => {
        if (!mounted) {
          return;
        }

        if (error || !data.user) {
          router.replace("/login");
          return;
        }

        const role = getUserRole(data.user.user_metadata?.role);

        if (requiredRole && requiredRole !== role) {
          router.replace(getRoleFallbackRoute(requiredRole));
          return;
        }

        setReady(true);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) {
          return;
        }

        if (!session) {
          setReady(false);
          router.replace("/login");
          return;
        }

        const role = getUserRole(session.user.user_metadata?.role);
        if (requiredRole && requiredRole !== role) {
          router.replace(getRoleFallbackRoute(requiredRole));
          return;
        }

        setReady(true);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } catch (guardError) {
      setMessage(
        guardError instanceof Error
          ? guardError.message
          : "Nao foi possivel carregar o acesso protegido.",
      );
    }

    return () => {
      mounted = false;
    };
  }, [requiredRole, router]);

  if (message) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-sm text-slate-600">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="font-semibold text-slate-900">Acesso protegido</p>
          <p className="mt-2 leading-6">{message}</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-sm text-slate-600">
        Verificando acesso...
      </div>
    );
  }

  return <>{children}</>;
}
