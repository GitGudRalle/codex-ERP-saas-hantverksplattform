import { initialCustomers, initialSites } from "@/lib/demo-data";

const customerTypeLabels = {
  private: "Privatkund",
  business: "Företag",
  brf: "BRF",
  property_owner: "Fastighetsägare",
} as const;

export function CustomerList() {
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <p className="text-sm font-medium text-action">Kunder</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Kundregister</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Första versionen visar kund och arbetsplats tydligt. Skapande av ny
          kund sker i arbetsorderflödet tills riktig datalagring är inkopplad.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {initialCustomers.map((customer) => {
          const customerSites = initialSites.filter(
            (site) => site.customerId === customer.id,
          );

          return (
            <article
              className="rounded-lg border border-line bg-white p-4"
              key={customer.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {customerTypeLabels[customer.type]}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-ink">
                    {customer.name}
                  </h2>
                </div>
                <a
                  className="flex min-h-11 items-center justify-center rounded-lg bg-action px-4 text-sm font-semibold text-white"
                  href={`tel:${customer.phone}`}
                >
                  Ring
                </a>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p>{customer.phone}</p>
                {customer.email ? <p>{customer.email}</p> : null}
                {customerSites.map((site) => (
                  <p key={site.id}>
                    {site.address}, {site.city}
                  </p>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
