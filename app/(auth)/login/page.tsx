import Link from "next/link";

const highlights = [
  "Gestao de pacientes com visao clara",
  "Planos nutricionais organizados",
  "Agenda pronta para consultas",
];

export default function LoginPage() {
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
                  Entrar na plataforma
                </h2>
                <p className="text-sm leading-6 text-slate-500">
                  Tela visual de login pronta para a primeira etapa do projeto.
                </p>
              </div>

              <form className="mt-8 space-y-5">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    E-mail
                  </span>
                  <input
                    type="email"
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
                    placeholder="Digite sua senha"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                  />
                </label>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-600">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Lembrar acesso
                  </label>
                  <Link
                    href="/dashboard"
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    Esqueci a senha
                  </Link>
                </div>

                <Link
                  href="/dashboard"
                  className="flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Acessar dashboard
                </Link>
              </form>

              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Login visual, sem autenticao real nesta etapa.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
