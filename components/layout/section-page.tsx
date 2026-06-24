export function SectionPage({
  eyebrow,
  title,
  description,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
}>) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
          {eyebrow}
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            "Base visual criada",
            "Sem dados reais por enquanto",
            "Pronta para evoluir na proxima etapa",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-700"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
