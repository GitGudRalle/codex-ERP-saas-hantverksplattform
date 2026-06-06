"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Summary = {
  customers: number;
  workOrders: number;
  assignedJobs: number;
  readyForInvoice: number;
};

const emptySummary: Summary = {
  customers: 0,
  workOrders: 0,
  assignedJobs: 0,
  readyForInvoice: 0,
};

const nextSteps = [
  {
    href: "/work-orders",
    label: "Testa kund till arbetsorder",
    detail: "Skapa kundärende och tilldela montör.",
  },
  {
    href: "/jobs",
    label: "Testa Mina jobb",
    detail: "Ändra status som montör på mobil.",
  },
  {
    href: "/invoice-drafts",
    label: "Skapa fakturaunderlag",
    detail: "Spara fakturatext från tid och material.",
  },
];

export function DashboardSummary() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        setSummary(emptySummary);
        setIsLoading(false);
        return;
      }

      const [customersResult, workOrdersResult, assignedJobsResult, readyResult] =
        await Promise.all([
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
            .eq("status", "ready_for_invoice"),
        ]);

      setSummary({
        customers: customersResult.count ?? 0,
        workOrders: workOrdersResult.count ?? 0,
        assignedJobs: assignedJobsResult.count ?? 0,
        readyForInvoice: readyResult.count ?? 0,
      });
      setIsLoading(false);
    }

    loadSummary();
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
        <h2 className="text-lg font-semibold text-ink">Prova flöden</h2>
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
