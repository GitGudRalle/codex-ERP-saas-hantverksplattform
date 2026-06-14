"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Summary = {
  blockedJobs: number;
  completedJobs: number;
  customers: number;
  unassignedJobs: number;
  workOrders: number;
  assignedJobs: number;
  readyForInvoice: number;
};

const emptySummary: Summary = {
  blockedJobs: 0,
  completedJobs: 0,
  customers: 0,
  unassignedJobs: 0,
  workOrders: 0,
  assignedJobs: 0,
  readyForInvoice: 0,
};

const nextSteps = [
  {
    href: "/work-orders",
    label: "Skapa arbetsorder",
    detail: "Skapa kundärende och tilldela montör.",
  },
  {
    href: "/jobs",
    label: "Öppna Mina jobb",
    detail: "Byt status, rapportera tid och dokumentera i fält.",
  },
  {
    href: "/invoice-drafts",
    label: "Skapa fakturaunderlag",
    detail: "Granska tid, material, anteckningar och foton.",
  },
];

export function DashboardSummary() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fallbackTimer = window.setTimeout(() => {
      if (isMounted) {
        setSummary(emptySummary);
        setIsLoading(false);
      }
    }, 3000);

    async function loadSummary() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        if (isMounted) {
          setSummary(emptySummary);
          setIsLoading(false);
        }
        return;
      }

      const [
        customersResult,
        workOrdersResult,
        assignedJobsResult,
        unassignedJobsResult,
        completedJobsResult,
        blockedJobsResult,
        readyResult,
      ] = await Promise.all([
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("work_orders").select("id", {
          count: "exact",
          head: true,
        }),
        supabase
          .from("work_orders")
          .select("id", { count: "exact", head: true })
          .not("assigned_to", "is", null),
        supabase
          .from("work_orders")
          .select("id", { count: "exact", head: true })
          .is("assigned_to", null),
        supabase
          .from("work_orders")
          .select("id", { count: "exact", head: true })
          .eq("status", "completed"),
        supabase
          .from("work_orders")
          .select("id", { count: "exact", head: true })
          .in("status", ["waiting_for_material", "waiting_for_customer"]),
        supabase
          .from("work_orders")
          .select("id", { count: "exact", head: true })
          .eq("status", "ready_for_invoice"),
      ]);

      if (isMounted) {
        setSummary({
          blockedJobs: blockedJobsResult.count ?? 0,
          completedJobs: completedJobsResult.count ?? 0,
          customers: customersResult.count ?? 0,
          unassignedJobs: unassignedJobsResult.count ?? 0,
          workOrders: workOrdersResult.count ?? 0,
          assignedJobs: assignedJobsResult.count ?? 0,
          readyForInvoice: readyResult.count ?? 0,
        });
        setIsLoading(false);
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
      window.clearTimeout(fallbackTimer);
    };
  }, [supabase]);

  const stats = [
    { label: "Kunder", value: summary.customers, detail: "Synliga via RLS" },
    {
      label: "Arbetsordrar",
      value: summary.workOrders,
      detail: "I ditt företag",
    },
    {
      label: "Tilldelade jobb",
      value: summary.assignedJobs,
      detail: "Har montör",
    },
    {
      label: "Klar för faktura",
      value: summary.readyForInvoice,
      detail: "Väntar admin",
    },
  ];

  const attentionItems = [
    {
      detail: "Behöver få en montör innan jobbet kan utföras.",
      href: "/work-orders",
      label: "Otilldelade jobb",
      value: summary.unassignedJobs,
    },
    {
      detail: "Klara jobb som behöver granskas och skickas vidare.",
      href: "/work-orders",
      label: "Klara att granska",
      value: summary.completedJobs,
    },
    {
      detail: "Jobb som väntar på material eller kund.",
      href: "/work-orders",
      label: "Väntar",
      value: summary.blockedJobs,
    },
    {
      detail: "Arbetsordrar redo att bli fakturaunderlag.",
      href: "/invoice-drafts",
      label: "Fakturaunderlag",
      value: summary.readyForInvoice,
    },
  ];

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            className="rounded-lg border border-line bg-white p-4"
            key={stat.label}
          >
            <p className="text-sm font-medium text-slate-600">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-ink">
              {isLoading ? "..." : stat.value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-line bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Att göra nu</h2>
            <p className="mt-1 text-sm text-slate-600">
              Kort driftlista för ägare och admin.
            </p>
          </div>
          <span className="inline-flex min-h-8 items-center rounded-full border border-line px-3 text-sm font-medium text-slate-700">
            {isLoading
              ? "Laddar"
              : `${attentionItems.reduce((sum, item) => sum + item.value, 0)} saker`}
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {attentionItems.map((item) => (
            <Link
              className="rounded-lg border border-line bg-field p-4 hover:border-action"
              href={item.href}
              key={item.label}
            >
              <p className="text-sm font-semibold text-ink">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-ink">
                {isLoading ? "..." : item.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.detail}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">Vanliga flöden</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {nextSteps.map((step) => (
            <Link
              className="rounded-lg border border-line bg-field p-4 hover:border-action"
              href={step.href}
              key={step.href}
            >
              <p className="text-sm font-semibold text-ink">{step.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {step.detail}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
