export function EmptyState({
  eyebrow,
  title,
  description,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
}>) {
  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
          {eyebrow}
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
          {description}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            "Layout limpo",
            "Responsivo",
            "Sem banco de dados ainda",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
