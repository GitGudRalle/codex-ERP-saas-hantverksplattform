import Link from "next/link";

const stats = [
  { label: "Kunder", value: "2", detail: "Demo-register" },
  { label: "Arbetsordrar", value: "3", detail: "Första MVP-flödet" },
  { label: "Mina jobb", value: "2", detail: "Tilldelade till Erik" },
  { label: "RLS-migration", value: "1", detail: "Company-scopad grund" },
];

const nextSteps = [
  {
    href: "/work-orders",
    label: "Testa kund till arbetsorder",
    detail: "Skapa kundärende och tilldela montör.",
  },
  {
    href: "/jobs",
    label: "Testa Mina jobb",
    detail: "Ändra status som montör på mobil.",
  },
  {
    href: "/invoice-drafts",
    label: "Planera fakturaunderlag",
    detail: "Nästa produktsteg efter tid och material.",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <p className="text-sm font-medium text-action">Dashboard</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal text-ink">
          Dagens drift
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          En enkel startvy för Ljungqvist Elservice AB. Nu finns första
          databasgrunden, kund till arbetsorder-flöde och montörens mobilvy
          som lokal MVP-prototyp.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            className="rounded-lg border border-line bg-white p-4"
            key={stat.label}
          >
            <p className="text-sm font-medium text-slate-600">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-ink">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">Prova flöden</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {nextSteps.map((step) => (
            <Link
              className="rounded-lg border border-line bg-field p-4 hover:border-action"
              href={step.href}
              key={step.href}
            >
              <p className="text-sm font-semibold text-ink">{step.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {step.detail}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
