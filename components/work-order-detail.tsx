"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { WorkOrderPhotoGallery } from "@/components/work-order-photo-gallery";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  CustomerRow,
  InvoiceDraftRow,
  MaterialEntryRow,
  ProfileRow,
  SiteRow,
  TimeEntryRow,
  WorkOrderNoteRow,
  WorkOrderPhotoRow,
  WorkOrderRow,
} from "@/lib/supabase/types";

type WorkOrderDetailProps = {
  workOrderId: string;
};

function formatDateTime(value: string | null) {
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

export function WorkOrderDetail({ workOrderId }: WorkOrderDetailProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [workOrder, setWorkOrder] = useState<WorkOrderRow | null>(null);
  const [customer, setCustomer] = useState<CustomerRow | null>(null);
  const [site, setSite] = useState<SiteRow | null>(null);
  const [electrician, setElectrician] = useState<ProfileRow | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntryRow[]>([]);
  const [materialEntries, setMaterialEntries] = useState<MaterialEntryRow[]>([]);
  const [notes, setNotes] = useState<WorkOrderNoteRow[]>([]);
  const [photos, setPhotos] = useState<WorkOrderPhotoRow[]>([]);
  const [invoiceDraft, setInvoiceDraft] = useState<InvoiceDraftRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canManage =
    profile?.role === "admin" || profile?.role === "manager";

  const totalHours = timeEntries.reduce(
    (sum, entry) => sum + Number(entry.hours),
    0,
  );
  const hasReportedTime = totalHours > 0;
  const hasReportedMaterial = materialEntries.length > 0;
  const hasDocumentation = notes.length > 0 || photos.length > 0;
  const hasInvoiceDraft = Boolean(invoiceDraft);
  const reviewItems = [
    {
      isComplete: hasReportedTime,
      label: "Tid",
      missingText: "Saknar rapporterad tid",
      readyText: `${totalHours.toLocaleString("sv-SE")} h rapporterat`,
    },
    {
      isComplete: hasReportedMaterial,
      label: "Material",
      missingText: "Inget material rapporterat",
      readyText: `${materialEntries.length} materialrader`,
    },
    {
      isComplete: hasDocumentation,
      label: "Dokumentation",
      missingText: "Saknar anteckning eller foto",
      readyText: `${notes.length} anteckningar, ${photos.length} foton`,
    },
    {
      isComplete: hasInvoiceDraft,
      label: "Fakturaunderlag",
      missingText: "Inte sparat ännu",
      readyText: "Sparat",
    },
  ];
  const missingReviewItems = reviewItems.filter((item) => !item.isComplete).length;

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setProfile(null);
      setWorkOrder(null);
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

    const workOrderResult = await supabase
      .from("work_orders")
      .select("*")
      .eq("id", workOrderId)
      .single();

    if (workOrderResult.error || !workOrderResult.data) {
      setProfile(profileResult.data as ProfileRow);
      setWorkOrder(null);
      setError("Kunde inte hämta arbetsordern. Kontrollera behörighet och länk.");
      setIsLoading(false);
      return;
    }

    const nextWorkOrder = workOrderResult.data as WorkOrderRow;

    const [
      customerResult,
      siteResult,
      electricianResult,
      timeResult,
      materialResult,
      notesResult,
      photosResult,
      invoiceResult,
    ] = await Promise.all([
      supabase
        .from("customers")
        .select("*")
        .eq("id", nextWorkOrder.customer_id)
        .single(),
      supabase.from("sites").select("*").eq("id", nextWorkOrder.site_id).single(),
      nextWorkOrder.assigned_to
        ? supabase
            .from("profiles")
            .select("*")
            .eq("id", nextWorkOrder.assigned_to)
            .single()
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from("time_entries")
        .select("*")
        .eq("work_order_id", nextWorkOrder.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("material_entries")
        .select("*")
        .eq("work_order_id", nextWorkOrder.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("work_order_notes")
        .select("*")
        .eq("work_order_id", nextWorkOrder.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("work_order_photos")
        .select("*")
        .eq("work_order_id", nextWorkOrder.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("invoice_drafts")
        .select("*")
        .eq("work_order_id", nextWorkOrder.id)
        .maybeSingle(),
    ]);

    if (
      customerResult.error ||
      siteResult.error ||
      timeResult.error ||
      materialResult.error ||
      notesResult.error ||
      photosResult.error ||
      invoiceResult.error
    ) {
      setError("Kunde inte hämta all arbetsorderdata från Supabase.");
      setIsLoading(false);
      return;
    }

    setProfile(profileResult.data as ProfileRow);
    setWorkOrder(nextWorkOrder);
    setCustomer(customerResult.data as CustomerRow);
    setSite(siteResult.data as SiteRow);
    setElectrician((electricianResult.data as ProfileRow | null) ?? null);
    setTimeEntries((timeResult.data ?? []) as TimeEntryRow[]);
    setMaterialEntries((materialResult.data ?? []) as MaterialEntryRow[]);
    setNotes((notesResult.data ?? []) as WorkOrderNoteRow[]);
    setPhotos((photosResult.data ?? []) as WorkOrderPhotoRow[]);
    setInvoiceDraft((invoiceResult.data as InvoiceDraftRow | null) ?? null);
    setIsLoading(false);
  }, [supabase, workOrderId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (isLoading) {
    return (
      <section className="rounded-lg border border-line bg-white p-5">
        <p className="text-sm font-medium text-slate-600">
          Hämtar arbetsorder...
        </p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="rounded-lg border border-line bg-white p-5">
        <h1 className="text-xl font-semibold text-ink">
          Logga in för att se arbetsordern
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Arbetsordrar visas bara för rätt företag och roll via RLS.
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

  if (error || !workOrder) {
    return (
      <section className="rounded-lg border border-line bg-white p-5">
        <h1 className="text-xl font-semibold text-ink">Arbetsorder saknas</h1>
        <p className="mt-2 text-sm text-slate-600">
          {error ?? "Arbetsordern kunde inte visas."}
        </p>
        <Link
          className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-line px-4 text-sm font-semibold text-ink"
          href={profile.role === "electrician" ? "/jobs" : "/work-orders"}
        >
          Tillbaka
        </Link>
      </section>
    );
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${site?.address ?? ""} ${site?.city ?? ""}`,
  )}`;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-action">Arbetsorder</p>
            <h1 className="mt-2 text-2xl font-semibold text-ink">
              {workOrder.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {workOrder.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={workOrder.status} />
            <PriorityBadge priority={workOrder.priority} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Kund och plats</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-ink">Kund:</span>{" "}
              {customer?.name ?? "Saknas"}
            </p>
            <p>
              <span className="font-semibold text-ink">Telefon:</span>{" "}
              {customer?.phone ?? "Saknas"}
            </p>
            <p>
              <span className="font-semibold text-ink">Adress:</span>{" "}
              {site ? `${site.address}${site.city ? `, ${site.city}` : ""}` : "Saknas"}
            </p>
            {site?.access_notes ? (
              <p>
                <span className="font-semibold text-ink">Tillträde:</span>{" "}
                {site.access_notes}
              </p>
            ) : null}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a
              className="flex min-h-11 items-center justify-center rounded-lg bg-action px-3 text-sm font-semibold text-white"
              href={`tel:${customer?.phone ?? ""}`}
            >
              Ring kund
            </a>
            <a
              className="flex min-h-11 items-center justify-center rounded-lg border border-line bg-field px-3 text-sm font-semibold text-ink"
              href={mapsUrl}
              rel="noreferrer"
              target="_blank"
            >
              Öppna karta
            </a>
          </div>
        </article>

        <article className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Läge</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-field p-3">
              <p className="text-sm text-slate-600">Montör</p>
              <p className="mt-1 font-semibold text-ink">
                {electrician?.full_name ?? "Inte tilldelad"}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-field p-3">
              <p className="text-sm text-slate-600">Bokad</p>
              <p className="mt-1 font-semibold text-ink">
                {formatDateTime(workOrder.scheduled_start)}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-field p-3">
              <p className="text-sm text-slate-600">Klar</p>
              <p className="mt-1 font-semibold text-ink">
                {formatDateTime(workOrder.completed_at)}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-field p-3">
              <p className="text-sm text-slate-600">Fakturaunderlag</p>
              <p className="mt-1 font-semibold text-ink">
                {invoiceDraft ? "Sparat" : "Saknas"}
              </p>
            </div>
          </div>
        </article>
      </section>

      {canManage ? (
        <section className="rounded-lg border border-line bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">
                Granskning inför fakturering
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Snabb kontroll av det som brukar saknas innan fakturan kan
                skapas.
              </p>
            </div>
            <span className="inline-flex min-h-8 items-center rounded-full border border-line px-3 text-sm font-medium text-slate-700">
              {missingReviewItems === 0
                ? "Allt finns"
                : `${missingReviewItems} kvar`}
            </span>
          </div>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {reviewItems.map((item) => (
              <li
                className={`rounded-lg border px-3 py-3 ${
                  item.isComplete
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-amber-200 bg-amber-50"
                }`}
                key={item.label}
              >
                <p
                  className={`text-sm font-semibold ${
                    item.isComplete ? "text-emerald-950" : "text-amber-950"
                  }`}
                >
                  {item.label}
                </p>
                <p
                  className={`mt-1 text-sm ${
                    item.isComplete ? "text-emerald-800" : "text-amber-800"
                  }`}
                >
                  {item.isComplete ? item.readyText : item.missingText}
                </p>
              </li>
            ))}
          </ul>

          {missingReviewItems === 0 && workOrder.status === "ready_for_invoice" ? (
            <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
              Arbetsordern är redo att användas som fakturaunderlag.
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Tid</h2>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {totalHours.toLocaleString("sv-SE")} h
          </p>
          <div className="mt-4 space-y-2">
            {timeEntries.length === 0 ? (
              <p className="text-sm text-slate-600">Ingen tid rapporterad.</p>
            ) : (
              timeEntries.map((entry) => (
                <div className="rounded-lg border border-line bg-field p-3" key={entry.id}>
                  <p className="text-sm font-semibold text-ink">
                    {Number(entry.hours).toLocaleString("sv-SE")} h
                  </p>
                  {entry.description ? (
                    <p className="mt-1 text-sm text-slate-600">
                      {entry.description}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Material</h2>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {materialEntries.length} rader
          </p>
          <div className="mt-4 space-y-2">
            {materialEntries.length === 0 ? (
              <p className="text-sm text-slate-600">Inget material rapporterat.</p>
            ) : (
              materialEntries.map((entry) => (
                <div className="rounded-lg border border-line bg-field p-3" key={entry.id}>
                  <p className="text-sm font-semibold text-ink">{entry.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {Number(entry.quantity).toLocaleString("sv-SE")} {entry.unit}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Dokumentation</h2>
          <div className="mt-4 grid gap-3">
            <div className="rounded-lg border border-line bg-field p-3">
              <p className="text-sm text-slate-600">Anteckningar</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{notes.length}</p>
            </div>
            <div className="rounded-lg border border-line bg-field p-3">
              <p className="text-sm text-slate-600">Foton</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{photos.length}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Anteckningar</h2>
          <div className="mt-4 space-y-2">
            {notes.length === 0 ? (
              <p className="text-sm text-slate-600">Inga anteckningar ännu.</p>
            ) : (
              notes.map((note) => (
                <div className="rounded-lg border border-line bg-field p-3" key={note.id}>
                  <p className="text-sm leading-6 text-slate-700">{note.note}</p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {formatDateTime(note.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Fakturaunderlag</h2>
          {invoiceDraft ? (
            <div className="mt-4 rounded-lg border border-line bg-field p-3">
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {invoiceDraft.invoice_text}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              Inget fakturaunderlag sparat ännu.
            </p>
          )}
          {canManage ? (
            <Link
              className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-line px-4 text-sm font-semibold text-ink hover:border-action"
              href="/invoice-drafts"
            >
              Öppna fakturaunderlag
            </Link>
          ) : null}
        </article>
      </section>

      <section className="rounded-lg border border-line bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Foton</h2>
            <p className="mt-1 text-sm text-slate-600">
              Dokumentationsbilder från montörens mobil.
            </p>
          </div>
          <span className="inline-flex min-h-8 items-center rounded-full border border-line px-3 text-sm font-medium text-slate-700">
            {photos.length} st
          </span>
        </div>
        <div className="mt-4">
          <WorkOrderPhotoGallery photos={photos} />
        </div>
      </section>

      <Link
        className="inline-flex min-h-11 items-center rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink hover:border-action"
        href={profile.role === "electrician" ? "/jobs" : "/work-orders"}
      >
        Tillbaka
      </Link>
    </div>
  );
}
