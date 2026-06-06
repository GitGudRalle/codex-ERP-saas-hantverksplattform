"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { priorityLabels, type WorkOrderPriority } from "@/lib/domain";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  CustomerRow,
  MaterialEntryRow,
  ProfileRow,
  SiteRow,
  TimeEntryRow,
  WorkOrderRow,
} from "@/lib/supabase/types";
import { customerRequestSchema } from "@/lib/validation";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formatScheduled(value: string | null) {
  if (!value) {
    return "Ej bokad";
  }

  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function CustomerWorkOrderFlow() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [electricians, setElectricians] = useState<ProfileRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderRow[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntryRow[]>([]);
  const [materialEntries, setMaterialEntries] = useState<MaterialEntryRow[]>([]);
  const [message, setMessage] = useState("Redo att registrera nästa kundärende.");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const canManage =
    profile?.role === "admin" || profile?.role === "manager";

  const unassignedWorkOrders = useMemo(
    () => workOrders.filter((workOrder) => !workOrder.assigned_to),
    [workOrders],
  );

  const completedWorkOrders = useMemo(
    () => workOrders.filter((workOrder) => workOrder.status === "completed"),
    [workOrders],
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setProfile(null);
      setElectricians([]);
      setCustomers([]);
      setSites([]);
      setWorkOrders([]);
      setTimeEntries([]);
      setMaterialEntries([]);
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

    const [
      profilesResult,
      customersResult,
      sitesResult,
      workOrdersResult,
      timeEntriesResult,
      materialEntriesResult,
    ] = await Promise.all([
        supabase.from("profiles").select("*").order("full_name"),
        supabase.from("customers").select("*").order("created_at", {
          ascending: false,
        }),
        supabase.from("sites").select("*").order("created_at", {
          ascending: false,
        }),
        supabase.from("work_orders").select("*").order("created_at", {
          ascending: false,
        }),
        supabase.from("time_entries").select("*").order("created_at", {
          ascending: false,
        }),
        supabase.from("material_entries").select("*").order("created_at", {
          ascending: false,
        }),
      ]);

    if (
      profilesResult.error ||
      customersResult.error ||
      sitesResult.error ||
      workOrdersResult.error ||
      timeEntriesResult.error ||
      materialEntriesResult.error
    ) {
      setError("Kunde inte hämta arbetsdata från Supabase.");
      setIsLoading(false);
      return;
    }

    setProfile(profileResult.data as ProfileRow);
    setElectricians(
      ((profilesResult.data ?? []) as ProfileRow[]).filter(
        (item) => item.role === "electrician",
      ),
    );
    setCustomers((customersResult.data ?? []) as CustomerRow[]);
    setSites((sitesResult.data ?? []) as SiteRow[]);
    setWorkOrders((workOrdersResult.data ?? []) as WorkOrderRow[]);
    setTimeEntries((timeEntriesResult.data ?? []) as TimeEntryRow[]);
    setMaterialEntries((materialEntriesResult.data ?? []) as MaterialEntryRow[]);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function createRequest(formData: FormData) {
    if (!profile || !canManage) {
      setError("Du behöver vara admin eller manager för att skapa arbetsorder.");
      return false;
    }

    const result = customerRequestSchema.safeParse({
      customerName: getFormValue(formData, "customerName"),
      phone: getFormValue(formData, "phone"),
      address: getFormValue(formData, "address"),
      city: getFormValue(formData, "city"),
      title: getFormValue(formData, "title"),
      description: getFormValue(formData, "description"),
      priority: getFormValue(formData, "priority"),
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Kontrollera formuläret.");
      return false;
    }

    setIsSaving(true);
    setError(null);

    const customerResult = await supabase
      .from("customers")
      .insert({
        company_id: profile.company_id,
        name: result.data.customerName,
        phone: result.data.phone,
        customer_type: "private",
      })
      .select("*")
      .single();

    if (customerResult.error) {
      setError("Kunde inte skapa kund.");
      setIsSaving(false);
      return false;
    }

    const siteResult = await supabase
      .from("sites")
      .insert({
        company_id: profile.company_id,
        customer_id: customerResult.data.id,
        address: result.data.address,
        city: result.data.city,
      })
      .select("*")
      .single();

    if (siteResult.error) {
      setError("Kunde inte skapa arbetsplats.");
      setIsSaving(false);
      return false;
    }

    const workOrderResult = await supabase
      .from("work_orders")
      .insert({
        company_id: profile.company_id,
        customer_id: customerResult.data.id,
        site_id: siteResult.data.id,
        title: result.data.title,
        description: result.data.description,
        status: "new",
        priority: result.data.priority as WorkOrderPriority,
      })
      .select("*")
      .single();

    if (workOrderResult.error) {
      setError("Kunde inte skapa arbetsorder.");
      setIsSaving(false);
      return false;
    }

    setMessage(`Skapade arbetsorder ${workOrderResult.data.title}.`);
    setIsSaving(false);
    await loadData();
    return true;
  }

  async function assignWorkOrder(workOrderId: string, electricianId: string) {
    const electrician = electricians.find((item) => item.id === electricianId);

    const { error: updateError } = await supabase
      .from("work_orders")
      .update({
        assigned_to: electricianId,
        status: "assigned",
        scheduled_start: new Date().toISOString(),
      })
      .eq("id", workOrderId);

    if (updateError) {
      setError("Kunde inte tilldela arbetsorder.");
      return;
    }

    setMessage(`Arbetsorder tilldelades ${electrician?.full_name}.`);
    await loadData();
  }

  async function markReadyForInvoice(workOrderId: string) {
    setReviewingId(workOrderId);
    setError(null);

    const { error: updateError } = await supabase
      .from("work_orders")
      .update({
        status: "ready_for_invoice",
      })
      .eq("id", workOrderId);

    if (updateError) {
      setError("Kunde inte markera arbetsordern klar för fakturering.");
      setReviewingId(null);
      return;
    }

    setMessage("Arbetsordern är klar för fakturering.");
    await loadData();
    setReviewingId(null);
  }

  function getCustomer(customerId: string) {
    return customers.find((customer) => customer.id === customerId);
  }

  function getSite(siteId: string) {
    return sites.find((site) => site.id === siteId);
  }

  function getElectrician(electricianId?: string | null) {
    return electricians.find((electrician) => electrician.id === electricianId);
  }

  function getTimeEntries(workOrderId: string) {
    return timeEntries.filter((entry) => entry.work_order_id === workOrderId);
  }

  function getMaterialEntries(workOrderId: string) {
    return materialEntries.filter((entry) => entry.work_order_id === workOrderId);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <p className="text-sm font-medium text-action">Kund till arbetsorder</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">
          Registrera ärende snabbt
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Detta flöde skriver nu till Supabase. RLS kräver att du är inloggad
          som admin eller manager för att skapa och tilldela arbetsordrar.
        </p>
      </section>

      {!profile ? (
        <section className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">
            Logga in för att hantera arbetsordrar
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            När du loggar in används din profil och roll från Supabase.
          </p>
        </section>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form
          className="rounded-lg border border-line bg-white p-5"
          onSubmit={async (event) => {
            event.preventDefault();
            const wasCreated = await createRequest(
              new FormData(event.currentTarget),
            );
            if (wasCreated) {
              event.currentTarget.reset();
            }
          }}
        >
          <h2 className="text-lg font-semibold text-ink">Nytt kundärende</h2>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Kund</span>
              <input
                className="mt-1 min-h-12 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                disabled={!canManage || isSaving}
                name="customerName"
                placeholder="Anna Karlsson"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Telefon</span>
              <input
                className="mt-1 min-h-12 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                disabled={!canManage || isSaving}
                name="phone"
                placeholder="070-123 45 67"
                type="tel"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Adress
                </span>
                <input
                  className="mt-1 min-h-12 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                  disabled={!canManage || isSaving}
                  name="address"
                  placeholder="Björkgatan 12"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Ort</span>
                <input
                  className="mt-1 min-h-12 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                  disabled={!canManage || isSaving}
                  name="city"
                  placeholder="Skövde"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Rubrik</span>
              <input
                className="mt-1 min-h-12 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                disabled={!canManage || isSaving}
                name="title"
                placeholder="Felsökning uttag"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Beskrivning
              </span>
              <textarea
                className="mt-1 min-h-28 w-full rounded-lg border border-line px-3 py-2 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                disabled={!canManage || isSaving}
                name="description"
                placeholder="Vad behöver elektrikern veta?"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Prioritet
              </span>
              <select
                className="mt-1 min-h-12 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                defaultValue="normal"
                disabled={!canManage || isSaving}
                name="priority"
              >
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          <button
            className="mt-5 min-h-12 w-full rounded-lg bg-action px-4 text-base font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canManage || isSaving}
          >
            {isSaving ? "Sparar" : "Skapa kund och arbetsorder"}
          </button>
        </form>

        <div className="space-y-5">
          <section className="rounded-lg border border-line bg-white p-5">
            <h2 className="text-lg font-semibold text-ink">Nästa åtgärd</h2>
            <p className="mt-2 text-sm text-slate-600">
              {isLoading ? "Hämtar från Supabase..." : message}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-line bg-field p-3">
                <p className="text-sm text-slate-600">Kunder</p>
                <p className="mt-1 text-2xl font-semibold">{customers.length}</p>
              </div>
              <div className="rounded-lg border border-line bg-field p-3">
                <p className="text-sm text-slate-600">Arbetsordrar</p>
                <p className="mt-1 text-2xl font-semibold">
                  {workOrders.length}
                </p>
              </div>
              <div className="rounded-lg border border-line bg-field p-3">
                <p className="text-sm text-slate-600">Ej tilldelade</p>
                <p className="mt-1 text-2xl font-semibold">
                  {unassignedWorkOrders.length}
                </p>
              </div>
            </div>
          </section>

          {canManage ? (
            <section className="rounded-lg border border-line bg-white p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-ink">
                    Granska klara jobb
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Kontrollera tid och material innan arbetsordern går vidare
                    till fakturaunderlag.
                  </p>
                </div>
                <span className="inline-flex min-h-8 items-center rounded-full border border-line px-3 text-sm font-medium text-slate-700">
                  {completedWorkOrders.length} att granska
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {completedWorkOrders.length === 0 ? (
                  <p className="rounded-lg border border-line bg-field px-3 py-3 text-sm text-slate-600">
                    Inga klara arbetsordrar väntar på granskning.
                  </p>
                ) : (
                  completedWorkOrders.map((workOrder) => {
                    const customer = getCustomer(workOrder.customer_id);
                    const site = getSite(workOrder.site_id);
                    const electrician = getElectrician(workOrder.assigned_to);
                    const jobTimeEntries = getTimeEntries(workOrder.id);
                    const jobMaterialEntries = getMaterialEntries(workOrder.id);
                    const totalHours = jobTimeEntries.reduce(
                      (sum, entry) => sum + Number(entry.hours),
                      0,
                    );
                    const missingTime = totalHours <= 0;
                    const missingMaterial = jobMaterialEntries.length === 0;

                    return (
                      <article
                        className="rounded-lg border border-line bg-field p-4"
                        key={workOrder.id}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-500">
                              {customer?.name} · {site?.address}, {site?.city}
                            </p>
                            <h3 className="mt-1 text-lg font-semibold text-ink">
                              {workOrder.title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">
                              Montör:{" "}
                              {electrician?.full_name ?? "Inte tilldelad"}
                            </p>
                            <Link
                              className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-action"
                              href={`/work-orders/${workOrder.id}`}
                            >
                              Öppna detalj
                            </Link>
                          </div>
                          <StatusBadge status={workOrder.status} />
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-lg border border-line bg-white p-3">
                            <p className="text-sm text-slate-600">Tid</p>
                            <p className="mt-1 text-xl font-semibold text-ink">
                              {totalHours.toLocaleString("sv-SE")} h
                            </p>
                          </div>
                          <div className="rounded-lg border border-line bg-white p-3">
                            <p className="text-sm text-slate-600">Material</p>
                            <p className="mt-1 text-xl font-semibold text-ink">
                              {jobMaterialEntries.length} rader
                            </p>
                          </div>
                          <div className="rounded-lg border border-line bg-white p-3">
                            <p className="text-sm text-slate-600">Kontroll</p>
                            <p className="mt-1 text-sm font-semibold text-ink">
                              {missingTime || missingMaterial
                                ? "Behöver kollas"
                                : "Ser komplett ut"}
                            </p>
                          </div>
                        </div>

                        {missingTime || missingMaterial ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {missingTime ? (
                              <span className="inline-flex min-h-8 items-center rounded-full border border-amber-200 bg-amber-50 px-3 text-sm font-medium text-amber-900">
                                Saknar rapporterad tid
                              </span>
                            ) : null}
                            {missingMaterial ? (
                              <span className="inline-flex min-h-8 items-center rounded-full border border-amber-200 bg-amber-50 px-3 text-sm font-medium text-amber-900">
                                Inget material rapporterat
                              </span>
                            ) : null}
                          </div>
                        ) : null}

                        {jobMaterialEntries.length > 0 ? (
                          <div className="mt-3 space-y-2">
                            {jobMaterialEntries.slice(0, 3).map((entry) => (
                              <p
                                className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-slate-700"
                                key={entry.id}
                              >
                                <span className="font-semibold text-ink">
                                  {entry.name}
                                </span>{" "}
                                {Number(entry.quantity).toLocaleString("sv-SE")}{" "}
                                {entry.unit}
                              </p>
                            ))}
                          </div>
                        ) : null}

                        <button
                          className="mt-4 min-h-11 w-full rounded-lg bg-action px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                          disabled={reviewingId === workOrder.id}
                          onClick={() => markReadyForInvoice(workOrder.id)}
                          type="button"
                        >
                          {reviewingId === workOrder.id
                            ? "Markerar"
                            : "Markera klar för fakturering"}
                        </button>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          ) : null}

          <section className="rounded-lg border border-line bg-white p-5">
            <h2 className="text-lg font-semibold text-ink">Arbetsordrar</h2>
            <div className="mt-4 space-y-3">
              {workOrders.map((workOrder) => {
                const customer = getCustomer(workOrder.customer_id);
                const site = getSite(workOrder.site_id);
                const electrician = getElectrician(workOrder.assigned_to);

                return (
                  <article
                    className="rounded-lg border border-line bg-field p-4"
                    key={workOrder.id}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {formatScheduled(workOrder.scheduled_start)}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-ink">
                          {workOrder.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {customer?.name} · {site?.address}, {site?.city}
                        </p>
                        <Link
                          className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-action"
                          href={`/work-orders/${workOrder.id}`}
                        >
                          Öppna detalj
                        </Link>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={workOrder.status} />
                        <PriorityBadge priority={workOrder.priority} />
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {workOrder.description}
                    </p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-medium text-slate-700">
                        Montör: {electrician?.full_name ?? "Inte tilldelad"}
                      </p>
                      {!workOrder.assigned_to && canManage ? (
                        <div className="grid gap-2 sm:grid-cols-3">
                          {electricians.map((item) => (
                            <button
                              className="min-h-11 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-action"
                              key={item.id}
                              onClick={() => assignWorkOrder(workOrder.id, item.id)}
                              type="button"
                            >
                              Tilldela {item.full_name.split(" ")[0]}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
