"use client";

import { useMemo, useState } from "react";
import {
  electricians,
  initialCustomers,
  initialSites,
  initialWorkOrders,
} from "@/lib/demo-data";
import type { Customer, Site, WorkOrder, WorkOrderPriority } from "@/lib/domain";
import { priorityLabels } from "@/lib/domain";
import { customerRequestSchema } from "@/lib/validation";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function CustomerWorkOrderFlow() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [message, setMessage] = useState("Redo att registrera nästa kundärende.");
  const [error, setError] = useState<string | null>(null);

  const unassignedWorkOrders = useMemo(
    () => workOrders.filter((workOrder) => !workOrder.assignedTo),
    [workOrders],
  );

  function createRequest(formData: FormData) {
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

    const now = Date.now().toString();
    const customerId = `kund-${now}`;
    const siteId = `plats-${now}`;
    const workOrderId = `ao-${workOrders.length + 1001}`;

    const customer: Customer = {
      id: customerId,
      name: result.data.customerName,
      phone: result.data.phone,
      type: "private",
    };

    const site: Site = {
      id: siteId,
      customerId,
      address: result.data.address,
      city: result.data.city,
    };

    const workOrder: WorkOrder = {
      id: workOrderId,
      customerId,
      siteId,
      title: result.data.title,
      description: result.data.description,
      status: "new",
      priority: result.data.priority as WorkOrderPriority,
      scheduledLabel: "Ej bokad",
    };

    setCustomers((current) => [customer, ...current]);
    setSites((current) => [site, ...current]);
    setWorkOrders((current) => [workOrder, ...current]);
    setError(null);
    setMessage(`Skapade kund och arbetsorder ${workOrderId}.`);
    return true;
  }

  function assignWorkOrder(workOrderId: string, electricianId: string) {
    const electrician = electricians.find((item) => item.id === electricianId);

    setWorkOrders((current) =>
      current.map((workOrder) =>
        workOrder.id === workOrderId
          ? {
              ...workOrder,
              assignedTo: electricianId,
              status: "assigned",
              scheduledLabel: "Idag",
            }
          : workOrder,
      ),
    );
    setMessage(`Arbetsorder ${workOrderId} tilldelades ${electrician?.name}.`);
  }

  function getCustomer(customerId: string) {
    return customers.find((customer) => customer.id === customerId);
  }

  function getSite(siteId: string) {
    return sites.find((site) => site.id === siteId);
  }

  function getElectrician(electricianId?: string) {
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
          Första MVP-flödet är medvetet kort: fånga kund, adress, problem och
          skapa en arbetsorder som kan tilldelas montör.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form
          className="rounded-lg border border-line bg-white p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const wasCreated = createRequest(new FormData(event.currentTarget));
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
                name="customerName"
                placeholder="Anna Karlsson"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Telefon</span>
              <input
                className="mt-1 min-h-12 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
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
                  name="address"
                  placeholder="Björkgatan 12"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Ort</span>
                <input
                  className="mt-1 min-h-12 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                  name="city"
                  placeholder="Skövde"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Rubrik</span>
              <input
                className="mt-1 min-h-12 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
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

          <button className="mt-5 min-h-12 w-full rounded-lg bg-action px-4 text-base font-semibold text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2">
            Skapa kund och arbetsorder
          </button>
        </form>

        <div className="space-y-5">
          <section className="rounded-lg border border-line bg-white p-5">
            <h2 className="text-lg font-semibold text-ink">Nästa åtgärd</h2>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
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
                const customer = getCustomer(workOrder.customerId);
                const site = getSite(workOrder.siteId);
                const electrician = getElectrician(workOrder.assignedTo);

                return (
                  <article
                    className="rounded-lg border border-line bg-field p-4"
                    key={workOrder.id}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {workOrder.id}
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
                        Montör: {electrician?.name ?? "Inte tilldelad"}
                      </p>
                      {!workOrder.assignedTo ? (
                        <div className="grid gap-2 sm:grid-cols-3">
                          {electricians.map((item) => (
                            <button
                              className="min-h-11 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-action"
                              key={item.id}
                              onClick={() => assignWorkOrder(workOrder.id, item.id)}
                              type="button"
                            >
                              Tilldela {item.name.split(" ")[0]}
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
