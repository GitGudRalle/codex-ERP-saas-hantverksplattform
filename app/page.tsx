import { DashboardSummary } from "@/components/dashboard-summary";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <p className="text-sm font-medium text-action">Dashboard</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal text-ink">
          Dagens drift
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          En enkel startvy för Ljungqvist Elservice AB. Siffrorna hämtas från
          Supabase för inloggad användare och filtreras av RLS.
        </p>
      </section>

      <DashboardSummary />
    </div>
  );
}
