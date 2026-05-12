const stats = [
  { label: "Nya ärenden", value: "0", detail: "Väntar på första kundflödet" },
  { label: "Pågående jobb", value: "0", detail: "Tilldelade arbetsordrar" },
  { label: "Klara att granska", value: "0", detail: "Tid, material och foton" },
  { label: "Fakturaunderlag", value: "0", detail: "Redo för admin" },
];

const nextSteps = [
  "Skapa databasmodell med company_id och RLS",
  "Lägg till inloggning och rollstyrning",
  "Bygg kund- och arbetsorderflödet först",
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
          En enkel startvy för Ljungqvist Elservice AB. Här ska admin och
          ansvarig snabbt se vad som behöver bokas, utföras, granskas och
          faktureras.
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
        <h2 className="text-lg font-semibold text-ink">Nästa byggsteg</h2>
        <ul className="mt-4 space-y-3">
          {nextSteps.map((step) => (
            <li className="flex gap-3 text-sm text-slate-700" key={step}>
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-action" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
