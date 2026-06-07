"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  CustomerRow,
  ProfileRow,
  SiteRow,
  WorkOrderRow,
} from "@/lib/supabase/types";

type CustomerDetailProps = {
  customerId: string;
};

const customerTypeLabels: Record<string, string> = {
  private: "Privatkund",
  business: "Företag",
  brf: "BRF",
  property_owner: "Fastighetsägare",
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Ej satt";
  }

  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function CustomerDetail({ customerId }: CustomerDetailProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [customer, setCustomer] = useState<CustomerRow | null>(null);
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [savingSiteId, setSavingSiteId] = useState<string | null>(null);

  const canManage =
    profile?.role === "admin" || profile?.role === "manager";

  const loadCustomer = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setProfile(null);
      setCustomer(null);
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

    const [customerResult, sitesResult, workOrdersResult] = await Promise.all([
      supabase.from("customers").select("*").eq("id", customerId).single(),
      supabase
        .from("sites")
        .select("*")
        .eq("customer_id", customerId)
        .order("address"),
      supabase
        .from("work_orders")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false }),
    ]);

    if (customerResult.error || !customerResult.data) {
      setProfile(profileResult.data as ProfileRow);
      setError("Kunden kunde inte hämtas. Kontrollera behörighet och länk.");
      setIsLoading(false);
      return;
    }

    if (sitesResult.error || workOrdersResult.error) {
      setProfile(profileResult.data as ProfileRow);
      setError("Kunde inte hämta all kunddata från Supabase.");
      setIsLoading(false);
      return;
    }

    setProfile(profileResult.data as ProfileRow);
    setCustomer(customerResult.data as CustomerRow);
    setSites((sitesResult.data ?? []) as SiteRow[]);
    setWorkOrders((workOrdersResult.data ?? []) as WorkOrderRow[]);
    setIsLoading(false);
  }, [customerId, supabase]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  async function updateCustomer(formData: FormData) {
    if (!customer || !canManage) {
      setError("Du behÃ¶ver vara admin eller manager fÃ¶r att uppdatera kund.");
      return;
    }

    const name = getFormValue(formData, "name");

    if (name.length < 2) {
      setError("Ange kundens namn.");
      return;
    }

    setSavingCustomer(true);
    setError(null);
    setMessage(null);

    const { error: updateError } = await supabase
      .from("customers")
      .update({
        customer_type: getFormValue(formData, "customer_type") || "private",
        email: getFormValue(formData, "email") || null,
        name,
        phone: getFormValue(formData, "phone") || null,
      })
      .eq("id", customer.id);

    if (updateError) {
      setError(`Kunde inte uppdatera kunden: ${updateError.message}.`);
      setSavingCustomer(false);
      return;
    }

    setMessage("Kunduppgifter uppdaterade.");
    await loadCustomer();
    setSavingCustomer(false);
  }

  async function updateSite(site: SiteRow, formData: FormData) {
    if (!canManage) {
      setError("Du behÃ¶ver vara admin eller manager fÃ¶r att uppdatera arbetsplats.");
      return;
    }

    const address = getFormValue(formData, "address");

    if (address.length < 3) {
      setError("Ange arbetsplatsens adress.");
      return;
    }

    setSavingSiteId(site.id);
    setError(null);
    setMessage(null);

    const { error: updateError } = await supabase
      .from("sites")
      .update({
        access_notes: getFormValue(formData, "access_notes") || null,
        address,
        city: getFormValue(formData, "city") || null,
        name: getFormValue(formData, "name") || null,
      })
      .eq("id", site.id);

    if (updateError) {
      setError(`Kunde inte uppdatera arbetsplatsen: ${updateError.message}.`);
      setSavingSiteId(null);
      return;
    }

    setMessage("Arbetsplats uppdaterad.");
    await loadCustomer();
    setSavingSiteId(null);
  }

  if (isLoading) {
    return (
      <section className="rounded-lg border border-line bg-white p-5">
        <p className="text-sm font-medium text-slate-600">Hämtar kund...</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="rounded-lg border border-line bg-white p-5">
        <h1 className="text-xl font-semibold text-ink">
          Logga in för att se kunden
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Kunddata visas bara för rätt företag och roll via RLS.
        </p>
        <Link
          className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-action px-4 text-sm font-semibold text-white"
          href="/login"
        >
          Logga in
        </Link>
      </section>
    );
  }

  if (error || !customer) {
    return (
      <section className="rounded-lg border border-line bg-white p-5">
        <h1 className="text-xl font-semibold text-ink">Kund saknas</h1>
        <p className="mt-2 text-sm text-slate-600">
          {error ?? "Kunden kunde inte visas."}
        </p>
        <Link
          className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-line px-4 text-sm font-semibold text-ink"
          href="/customers"
        >
          Tillbaka till kunder
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-action">
              {customerTypeLabels[customer.customer_type] ??
                customer.customer_type}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-ink">
              {customer.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Skapad {formatDate(customer.created_at)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            {customer.phone ? (
              <a
                className="flex min-h-11 items-center justify-center rounded-lg bg-action px-4 text-sm font-semibold text-white"
                href={`tel:${customer.phone}`}
              >
                Ring
              </a>
            ) : null}
            {customer.email ? (
              <a
                className="flex min-h-11 items-center justify-center rounded-lg border border-line bg-field px-4 text-sm font-semibold text-ink"
                href={`mailto:${customer.email}`}
              >
                Mejla
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 lg:col-span-2">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 lg:col-span-2">
            {message}
          </p>
        ) : null}

        <article className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Kontakt</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-ink">Telefon:</span>{" "}
              {customer.phone ?? "Saknas"}
            </p>
            <p>
              <span className="font-semibold text-ink">E-post:</span>{" "}
              {customer.email ?? "Saknas"}
            </p>
          </div>
          {canManage ? (
            <form
              className="mt-5 grid gap-3"
              onSubmit={async (event) => {
                event.preventDefault();
                await updateCustomer(new FormData(event.currentTarget));
              }}
            >
              <label>
                <span className="text-sm font-medium text-slate-700">Namn</span>
                <input
                  className="mt-1 min-h-11 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                  defaultValue={customer.name}
                  name="name"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-slate-700">
                  Telefon
                </span>
                <input
                  className="mt-1 min-h-11 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                  defaultValue={customer.phone ?? ""}
                  name="phone"
                  type="tel"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-slate-700">
                  E-post
                </span>
                <input
                  className="mt-1 min-h-11 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                  defaultValue={customer.email ?? ""}
                  name="email"
                  type="email"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-slate-700">
                  Kundtyp
                </span>
                <select
                  className="mt-1 min-h-11 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                  defaultValue={customer.customer_type}
                  name="customer_type"
                >
                  {Object.entries(customerTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="min-h-11 rounded-lg bg-action px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={savingCustomer}
              >
                {savingCustomer ? "Sparar" : "Spara kunduppgifter"}
              </button>
            </form>
          ) : null}
        </article>

        <article className="rounded-lg border border-line bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">Arbetsplatser</h2>
            <span className="inline-flex min-h-8 items-center rounded-full border border-line px-3 text-sm font-medium text-slate-700">
              {sites.length}
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {sites.length === 0 ? (
              <p className="text-sm text-slate-600">
                Inga arbetsplatser registrerade.
              </p>
            ) : (
              sites.map((site) => (
                <div className="rounded-lg border border-line bg-field p-3" key={site.id}>
                  <p className="text-sm font-semibold text-ink">
                    {site.name ?? site.address}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {site.address}
                    {site.city ? `, ${site.city}` : ""}
                  </p>
                  {site.access_notes ? (
                    <p className="mt-2 text-sm text-slate-600">
                      Tillträde: {site.access_notes}
                    </p>
                  ) : null}
                  {canManage ? (
                    <form
                      className="mt-4 grid gap-3"
                      onSubmit={async (event) => {
                        event.preventDefault();
                        await updateSite(
                          site,
                          new FormData(event.currentTarget),
                        );
                      }}
                    >
                      <label>
                        <span className="text-sm font-medium text-slate-700">
                          Namn
                        </span>
                        <input
                          className="mt-1 min-h-11 w-full rounded-lg border border-line bg-white px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                          defaultValue={site.name ?? ""}
                          name="name"
                          placeholder="Ex. Villa, lager, butik"
                        />
                      </label>
                      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                        <label>
                          <span className="text-sm font-medium text-slate-700">
                            Adress
                          </span>
                          <input
                            className="mt-1 min-h-11 w-full rounded-lg border border-line bg-white px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                            defaultValue={site.address}
                            name="address"
                          />
                        </label>
                        <label>
                          <span className="text-sm font-medium text-slate-700">
                            Ort
                          </span>
                          <input
                            className="mt-1 min-h-11 w-full rounded-lg border border-line bg-white px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                            defaultValue={site.city ?? ""}
                            name="city"
                          />
                        </label>
                      </div>
                      <label>
                        <span className="text-sm font-medium text-slate-700">
                          TilltrÃ¤de
                        </span>
                        <textarea
                          className="mt-1 min-h-24 w-full rounded-lg border border-line bg-white px-3 py-2 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                          defaultValue={site.access_notes ?? ""}
                          name="access_notes"
                          placeholder="Kod, nyckel, port, kontaktperson eller annat montÃ¶ren behÃ¶ver veta."
                        />
                      </label>
                      <button
                        className="min-h-11 rounded-lg bg-action px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={savingSiteId === site.id}
                      >
                        {savingSiteId === site.id
                          ? "Sparar"
                          : "Spara arbetsplats"}
                      </button>
                    </form>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="rounded-lg border border-line bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Arbetsordrar</h2>
            <p className="mt-1 text-sm text-slate-600">
              Kundens aktiva och historiska jobb.
            </p>
          </div>
          <span className="inline-flex min-h-8 items-center rounded-full border border-line px-3 text-sm font-medium text-slate-700">
            {workOrders.length}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {workOrders.length === 0 ? (
            <p className="rounded-lg border border-line bg-field px-3 py-3 text-sm text-slate-600">
              Inga arbetsordrar finns för kunden ännu.
            </p>
          ) : (
            workOrders.map((workOrder) => {
              const site = sites.find((item) => item.id === workOrder.site_id);

              return (
                <article
                  className="rounded-lg border border-line bg-field p-4"
                  key={workOrder.id}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {site
                          ? `${site.address}${site.city ? `, ${site.city}` : ""}`
                          : "Arbetsplats saknas"}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-ink">
                        {workOrder.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {workOrder.description}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Bokad: {formatDate(workOrder.scheduled_start)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={workOrder.status} />
                      <PriorityBadge priority={workOrder.priority} />
                    </div>
                  </div>
                  <Link
                    className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink hover:border-action"
                    href={`/work-orders/${workOrder.id}`}
                  >
                    Öppna arbetsorder
                  </Link>
                </article>
              );
            })
          )}
        </div>
      </section>

      <Link
        className="inline-flex min-h-11 items-center rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink hover:border-action"
        href="/customers"
      >
        Tillbaka till kunder
      </Link>
    </div>
  );
}
