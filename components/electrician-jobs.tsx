"use client";

import { useMemo, useState } from "react";
import {
  electricians,
  initialCustomers,
  initialSites,
  initialWorkOrders,
} from "@/lib/demo-data";
import {
  nextFieldStatuses,
  workOrderStatusLabels,
  type WorkOrderStatus,
} from "@/lib/domain";
import type { WorkOrder } from "@/lib/domain";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";

const activeElectricianId = "montor-1";

export function ElectricianJobs() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const electrician = electricians.find((item) => item.id === activeElectricianId);

  const assignedJobs = useMemo(
    () => workOrders.filter((workOrder) => workOrder.assignedTo === activeElectricianId),
    [workOrders],
  );

  function updateStatus(workOrderId: string, status: WorkOrderStatus) {
    setWorkOrders((current) =>
      current.map((workOrder) =>
        workOrder.id === workOrderId ? { ...workOrder, status } : workOrder,
      ),
    );
  }

  function getCustomer(customerId: string) {
    return initialCustomers.find((customer) => customer.id === customerId);
  }

  function getSite(siteId: string) {
    return initialSites.find((site) => site.id === siteId);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <p className="text-sm font-medium text-action">Mina jobb</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">
          Dagens tilldelade jobb
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Inloggad demo-montör: {electrician?.name}. Här ska fältarbetet vara
          snabbt: ring, hitta adressen, läs jobbet och ändra status.
        </p>
      </section>

      <section className="grid gap-4">
        {assignedJobs.map((job) => {
          const customer = getCustomer(job.customerId);
          const site = getSite(job.siteId);
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
                    {job.scheduledLabel}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500">{job.id}</p>
                  <h2 className="mt-1 text-xl font-semibold text-ink">
                    {job.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {job.description}
                  </p>
                </div>

                <div className="rounded-lg border border-line bg-field p-3">
                  <p className="text-base font-semibold text-ink">
                    {customer?.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {site?.address}, {site?.city}
                  </p>
                  {site?.accessNotes ? (
                    <p className="mt-2 text-sm text-slate-700">
                      {site.accessNotes}
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
                  <p className="text-sm font-semibold text-ink">Ändra status</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {nextFieldStatuses.map((status) => (
                      <button
                        className={`min-h-12 rounded-lg border px-3 text-sm font-semibold ${
                          job.status === status
                            ? "border-action bg-action text-white"
                            : "border-line bg-field text-ink hover:border-action"
                        }`}
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
