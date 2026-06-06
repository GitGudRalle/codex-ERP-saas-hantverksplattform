"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { priorityLabels, type WorkOrderPriority } from "@/lib/domain";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  CustomerRow,
  ProfileRow,
  SiteRow,
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
  const [message, setMessage] = useState("Redo att registrera nästa kundärende.");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const canManage =
    profile?.role === "admin" || profile?.role === "manager";

  const unassignedWorkOrders = useMemo(
    () => workOrders.filter((workOrder) => !workOrder.assigned_to),
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

    const [profilesResult, customersResult, sitesResult, workOrdersResult] =
      await Promise.all([
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
      ]);

    if (
      profilesResult.error ||
      customersResult.error ||
      sitesResult.error ||
      workOrdersResult.error
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

  function getCustomer(customerId: string) {
    return customers.find((customer) => customer.id === customerId);
  }

  function getSite(siteId: string) {
    return sites.find((site) => site.id === siteId);
  }

  function getElectrician(electricianId?: string | null) {
    return electricians.find((electrician) => electrician.id === electricianId);
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
