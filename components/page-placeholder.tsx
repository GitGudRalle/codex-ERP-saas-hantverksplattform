type PagePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions: string[];
};

export function PagePlaceholder({
  eyebrow,
  title,
  description,
  actions,
}: PagePlaceholderProps) {
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <p className="text-sm font-medium text-action">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          {description}
        </p>
      </section>

      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="text-base font-semibold text-ink">Planerade åtgärder</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <div
              className="flex min-h-14 items-center rounded-lg border border-line bg-field px-4 text-sm font-medium text-ink"
              key={action}
            >
              {action}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
