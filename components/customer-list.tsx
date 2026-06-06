"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CustomerRow, SiteRow } from "@/lib/supabase/types";

const customerTypeLabels: Record<string, string> = {
  private: "Privatkund",
  business: "Företag",
  brf: "BRF",
  property_owner: "Fastighetsägare",
};

export function CustomerList() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomers() {
      setIsLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        setCustomers([]);
        setSites([]);
        setIsLoading(false);
        return;
      }

      const [customersResult, sitesResult] = await Promise.all([
        supabase.from("customers").select("*").order("created_at", {
          ascending: false,
        }),
        supabase.from("sites").select("*").order("created_at", {
          ascending: false,
        }),
      ]);

      if (customersResult.error || sitesResult.error) {
        setError("Kunde inte hämta kunder från Supabase.");
        setIsLoading(false);
        return;
      }

      setCustomers((customersResult.data ?? []) as CustomerRow[]);
      setSites((sitesResult.data ?? []) as SiteRow[]);
      setIsLoading(false);
    }

    loadCustomers();
  }, [supabase]);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <p className="text-sm font-medium text-action">Kunder</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Kundregister</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Kundlistan hämtas från Supabase och filtreras av RLS. Admin ser
          företagets kunder, montörer ser bara kunder kopplade till tilldelade
          arbetsordrar.
        </p>
      </section>

      {!isLoading && customers.length === 0 ? (
        <section className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">
            Logga in för att se kunder
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Det finns inga synliga kunder för den här sessionen.
          </p>
        </section>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2">
        {isLoading
          ? Array.from({ length: 2 }).map((_, index) => (
              <div
                className="h-40 rounded-lg border border-line bg-white"
                key={index}
              />
            ))
          : customers.map((customer) => {
              const customerSites = sites.filter(
                (site) => site.customer_id === customer.id,
              );

              return (
                <article
                  className="rounded-lg border border-line bg-white p-4"
                  key={customer.id}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {customerTypeLabels[customer.customer_type] ??
                          customer.customer_type}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-ink">
                        {customer.name}
                      </h2>
                    </div>
                    {customer.phone ? (
                      <a
                        className="flex min-h-11 items-center justify-center rounded-lg bg-action px-4 text-sm font-semibold text-white"
                        href={`tel:${customer.phone}`}
                      >
                        Ring
                      </a>
                    ) : null}
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-700">
                    {customer.phone ? <p>{customer.phone}</p> : null}
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
