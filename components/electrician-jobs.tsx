"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { nextFieldStatuses, workOrderStatusLabels, type WorkOrderStatus } from "@/lib/domain";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  CustomerRow,
  ProfileRow,
  SiteRow,
  WorkOrderRow,
} from "@/lib/supabase/types";

function formatScheduled(value: string | null) {
  if (!value) {
    return "Ej bokad";
  }

  return new Intl.DateTimeFormat("sv-SE", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ElectricianJobs() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setProfile(null);
      setCustomers([]);
      setSites([]);
      setWorkOrders([]);
      setIsLoading(false);
      return;
    }

    const profileResult = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    if (profileResult.error) {
      setError("Din användare saknar profil i Supabase.");
      setIsLoading(false);
      return;
    }

    const [workOrdersResult, customersResult, sitesResult] = await Promise.all([
      supabase.from("work_orders").select("*").order("scheduled_start", {
        ascending: true,
        nullsFirst: false,
      }),
      supabase.from("customers").select("*"),
      supabase.from("sites").select("*"),
    ]);

    if (workOrdersResult.error || customersResult.error || sitesResult.error) {
      setError("Kunde inte hämta tilldelade jobb från Supabase.");
      setIsLoading(false);
      return;
    }

    setProfile(profileResult.data as ProfileRow);
    setWorkOrders((workOrdersResult.data ?? []) as WorkOrderRow[]);
    setCustomers((customersResult.data ?? []) as CustomerRow[]);
    setSites((sitesResult.data ?? []) as SiteRow[]);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  async function updateStatus(workOrderId: string, status: WorkOrderStatus) {
    setUpdatingId(workOrderId);
    setError(null);

    const patch: Partial<WorkOrderRow> = {
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    };

    const { error: updateError } = await supabase
      .from("work_orders")
      .update(patch)
      .eq("id", workOrderId);

    if (updateError) {
      setError("Kunde inte ändra status. Kontrollera att jobbet är tilldelat dig.");
      setUpdatingId(null);
      return;
    }

    await loadJobs();
    setUpdatingId(null);
  }

  function getCustomer(customerId: string) {
    return customers.find((customer) => customer.id === customerId);
  }

  function getSite(siteId: string) {
    return sites.find((site) => site.id === siteId);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <p className="text-sm font-medium text-action">Mina jobb</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">
          Dagens tilldelade jobb
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {profile
            ? `Inloggad som ${profile.full_name}.`
            : "Logga in som montör för att se tilldelade arbetsordrar."}{" "}
          RLS avgör vilka jobb som visas.
        </p>
      </section>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {!isLoading && workOrders.length === 0 ? (
        <section className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Inga jobb att visa</h2>
          <p className="mt-2 text-sm text-slate-600">
            Antingen är du inte inloggad, eller så finns inga arbetsordrar som
            RLS tillåter för din profil.
          </p>
        </section>
      ) : null}

      <section className="grid gap-4">
        {isLoading
          ? Array.from({ length: 2 }).map((_, index) => (
              <div
                className="h-80 rounded-lg border border-line bg-white"
                key={index}
              />
            ))
          : workOrders.map((job) => {
              const customer = getCustomer(job.customer_id);
              const site = getSite(job.site_id);
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${site?.address ?? ""} ${site?.city ?? ""}`,
              )}`;

              return (
                <article
                  className="rounded-lg border border-line bg-white p-4 shadow-soft"
                  key={job.id}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={job.status} />
                      <PriorityBadge priority={job.priority} />
                      <span className="inline-flex min-h-8 items-center rounded-full border border-line px-3 text-sm font-medium text-slate-700">
                        {formatScheduled(job.scheduled_start)}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Arbetsorder
                      </p>
                      <h2 className="mt-1 text-xl font-semibold text-ink">
                        {job.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {job.description}
                      </p>
                    </div>

                    <div className="rounded-lg border border-line bg-field p-3">
                      <p className="text-base font-semibold text-ink">
                        {customer?.name ?? "Kund saknas"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {site?.address}, {site?.city}
                      </p>
                      {site?.access_notes ? (
                        <p className="mt-2 text-sm text-slate-700">
                          {site.access_notes}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <a
                        className="flex min-h-12 items-center justify-center rounded-lg bg-action px-3 text-center text-sm font-semibold text-white"
                        href={`tel:${customer?.phone ?? ""}`}
                      >
                        Ring kund
                      </a>
                      <a
                        className="flex min-h-12 items-center justify-center rounded-lg border border-line bg-field px-3 text-center text-sm font-semibold text-ink"
                        href={mapsUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Öppna karta
                      </a>
                      <button
                        className="min-h-12 rounded-lg border border-line bg-field px-3 text-sm font-semibold text-ink"
                        type="button"
                      >
                        Tid
                      </button>
                      <button
                        className="min-h-12 rounded-lg border border-line bg-field px-3 text-sm font-semibold text-ink"
                        type="button"
                      >
                        Material
                      </button>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Ändra status
                      </p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-3">
                        {nextFieldStatuses.map((status) => (
                          <button
                            className={`min-h-12 rounded-lg border px-3 text-sm font-semibold ${
                              job.status === status
                                ? "border-action bg-action text-white"
                                : "border-line bg-field text-ink hover:border-action"
                            }`}
                            disabled={updatingId === job.id}
                            key={status}
                            onClick={() => updateStatus(job.id, status)}
                            type="button"
                          >
                            {workOrderStatusLabels[status]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
      </section>
    </div>
  );
}
