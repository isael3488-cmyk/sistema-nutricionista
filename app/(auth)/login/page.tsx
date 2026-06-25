"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getRoleHomeRoute, getUserRole } from "@/lib/auth";
import { getPatientByUserId } from "@/lib/supabase/repositories";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const highlights = [
  "Gestao de pacientes com visao clara",
  "Planos nutricionais organizados",
  "Agenda pronta para consultas",
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [accountType, setAccountType] = useState<"patient" | "admin">("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    try {
      const supabase = getSupabaseBrowserClient();

      void supabase.auth.getUser().then(({ data }) => {
        if (!mounted || !data.user) {
          return;
        }

        void (async () => {
          try {
            const role = getUserRole(data.user.user_metadata?.role);
            if (role === "patient") {
              const patient = await getPatientByUserId(data.user.id);
              router.replace(patient ? "/patient" : "/patient/profile");
              return;
            }

            router.replace(getRoleHomeRoute(role));
          } catch {
            const role = getUserRole(data.user.user_metadata?.role);
            router.replace(getRoleHomeRoute(role));
          }
        })();
      });
    } catch {
      // The UI below explains when the Supabase env vars are missing.
    }

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setPendingConfirmationEmail(null);
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      if (mode === "login") {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        const role = getUserRole(data.user?.user_metadata?.role);
        if (role === "patient" && data.user) {
          const patient = await getPatientByUserId(data.user.id);
          router.replace(patient ? "/patient" : "/patient/profile");
        } else {
          router.replace(getRoleHomeRoute(role));
        }
        router.refresh();
        return;
      }

      if (password !== confirmPassword) {
        setError("A senha e a confirmacao precisam ser iguais.");
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: name.trim(),
            role: accountType,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        router.replace(accountType === "patient" ? "/patient/profile" : "/dashboard");
        router.refresh();
        return;
      }

      setNotice(
        accountType === "patient"
          ? "Conta criada. Se a confirmacao por e-mail estiver ativa, confirme a conta antes de completar o perfil do paciente."
          : "Conta criada. Verifique o e-mail para confirmar o cadastro e depois volte para entrar.",
      );
      setPendingConfirmationEmail(email.trim());
      setMode("login");
      setName("");
      setPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Nao foi possivel processar o acesso agora.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendConfirmation() {
    if (!pendingConfirmationEmail) {
      setError("Crie sua conta ou preencha o e-mail antes de reenviar a confirmacao.");
      return;
    }

    setError(null);
    setNotice(null);
    setResendingConfirmation(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: pendingConfirmationEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (resendError) {
        setError(resendError.message);
        return;
      }

      setNotice("Reenviamos o e-mail de confirmacao para o endereco informado.");
    } catch (resendError) {
      setError(
        resendError instanceof Error
          ? resendError.message
          : "Nao foi possivel reenviar a confirmacao agora.",
      );
    } finally {
      setResendingConfirmation(false);
    }
  }

  async function handlePasswordReset() {
    setError(null);
    setNotice(null);

    if (!email.trim()) {
      setError("Digite seu e-mail antes de solicitar a redefinicao.");
      return;
    }

    setResetting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/login`,
        },
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setNotice("Enviamos um link de redefinicao para o e-mail informado.");
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Nao foi possivel enviar o link de redefinicao.",
      );
    } finally {
      setResetting(false);
    }
  }

  return (
    <main className="min-h-screen bg-brand-gradient px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-soft backdrop-blur xl:grid-cols-[1.15fr_0.85fr]">
        <section className="relative hidden overflow-hidden border-r border-slate-200/80 bg-slate-950 px-8 py-10 text-white xl:flex xl:flex-col xl:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.28),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.18),_transparent_30%)]" />
          <div className="relative space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              NutriSaaS
            </div>
            <div className="max-w-xl space-y-5">
              <h1 className="text-4xl font-semibold tracking-tight text-white">
                Uma central moderna para nutricionistas acompanharem cada
                etapa da jornada do paciente.
              </h1>
              <p className="max-w-lg text-base leading-7 text-slate-300">
                Estrutura inicial preparada para evoluir com agenda, prontuarios
                e planos nutricionais em uma experiencia SaaS limpa e
                profissional.
              </p>
            </div>
            <div className="grid max-w-lg gap-4 sm:grid-cols-3">
              {[
                { label: "Pacientes", value: "120+" },
                { label: "Planos", value: "48" },
                { label: "Consultas", value: "310" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <div className="text-2xl font-semibold text-white">
                    {item.value}
                  </div>
                  <div className="mt-1 text-sm text-slate-300">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative space-y-4">
            <div className="text-sm uppercase tracking-[0.24em] text-slate-400">
              Funcionalidades planejadas
            </div>
            <ul className="space-y-3">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-8 xl:hidden">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                NutriSaaS
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-900/5">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                  {mode === "login"
                    ? "Entrar na plataforma"
                    : "Criar acesso"
                  }
                </h2>
                <p className="text-sm leading-6 text-slate-500">
                  {mode === "login"
                    ? "Acesso protegido por Supabase Auth com e-mail e senha."
                    : "Crie seu primeiro acesso com nome, e-mail e senha."
                  }
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    mode === "login"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    mode === "register"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Criar conta
                </button>
              </div>

              {mode === "register" ? (
                <div className="mt-5 grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setAccountType("patient")}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      accountType === "patient"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Paciente
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType("admin")}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      accountType === "admin"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Nutricionista
                  </button>
                </div>
              ) : null}

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {mode === "register" ? (
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Nome completo
                    </span>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Nome do cliente"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                    />
                  </label>
                ) : null}

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    E-mail
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nutricionista@clinica.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Senha
                  </span>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                  />
                </label>

                {mode === "register" ? (
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Confirmar senha
                    </span>
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Repita a senha"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                    />
                  </label>
                ) : null}

                <div className="flex items-center justify-between text-sm">
                  {mode === "login" ? (
                    <>
                      <label className="flex items-center gap-2 text-slate-600">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Lembrar acesso
                      </label>
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="font-medium text-blue-600 hover:text-blue-700"
                        disabled={resetting || loading}
                      >
                        {resetting ? "Enviando..." : "Esqueci a senha"}
                      </button>
                    </>
                  ) : (
                    <span className="text-slate-500">
                      Crie sua senha com pelo menos 6 caracteres.
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || resetting}
                  className="flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? mode === "login"
                      ? "Entrando..."
                      : "Criando conta..."
                    : mode === "login"
                      ? "Acessar dashboard"
                      : "Criar conta"}
                </button>
              </form>

              {error ? (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              {notice ? (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {notice}
                </div>
              ) : null}

              {pendingConfirmationEmail && mode === "login" ? (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendingConfirmation}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resendingConfirmation
                    ? "Reenviando..."
                    : "Reenviar confirmação"}
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setNotice(null);
                  setPendingConfirmationEmail(null);
                  setMode(mode === "login" ? "register" : "login");
                }}
                className="mt-5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {mode === "login"
                  ? "Nao tem conta? Criar acesso"
                  : "Ja tenho conta? Entrar"}
              </button>

              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Pacientes criam o proprio acesso e completam o perfil. Contas
                administrativas podem ser criadas manualmente no Supabase.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
