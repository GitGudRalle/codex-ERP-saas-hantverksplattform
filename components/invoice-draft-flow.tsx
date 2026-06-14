"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
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
import { invoiceDraftSchema } from "@/lib/validation";

const invoiceDraftStatusLabels: Record<InvoiceDraftRow["status"], string> = {
  draft: "Utkast",
  ready: "Redo",
  exported: "Exporterad",
};

function formatDate(value: string | null) {
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

function buildInvoiceText(
  workOrder: WorkOrderRow,
  customer: CustomerRow | undefined,
  site: SiteRow | undefined,
  timeEntries: TimeEntryRow[],
  materialEntries: MaterialEntryRow[],
  notes: WorkOrderNoteRow[],
  photos: WorkOrderPhotoRow[],
) {
  const totalHours = timeEntries.reduce(
    (sum, entry) => sum + Number(entry.hours),
    0,
  );

  const lines = [
    `Arbete: ${workOrder.title}`,
    customer ? `Kund: ${customer.name}` : null,
    site ? `Adress: ${site.address}${site.city ? `, ${site.city}` : ""}` : null,
    "",
    workOrder.description,
    "",
    totalHours > 0
      ? `Tid: ${totalHours.toLocaleString("sv-SE")} timmar`
      : "Tid: saknas",
    ...timeEntries
      .filter((entry) => entry.description)
      .map(
        (entry) =>
          `- ${Number(entry.hours).toLocaleString("sv-SE")} h: ${
            entry.description
          }`,
      ),
    "",
    materialEntries.length > 0 ? "Material:" : "Material: inget rapporterat",
    ...materialEntries.map(
      (entry) =>
        `- ${entry.name}, ${Number(entry.quantity).toLocaleString("sv-SE")} ${
          entry.unit
        }`,
    ),
    "",
    notes.length > 0 ? "Anteckningar:" : null,
    ...notes.map((note) => `- ${note.note}`),
    "",
    `Fotodokumentation: ${photos.length} foton`,
  ].filter((line) => line !== null);

  return lines.join("\n");
}

export function InvoiceDraftFlow() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderRow[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntryRow[]>([]);
  const [materialEntries, setMaterialEntries] = useState<MaterialEntryRow[]>([]);
  const [notes, setNotes] = useState<WorkOrderNoteRow[]>([]);
  const [photos, setPhotos] = useState<WorkOrderPhotoRow[]>([]);
  const [invoiceDrafts, setInvoiceDrafts] = useState<InvoiceDraftRow[]>([]);
  const [draftTexts, setDraftTexts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [invoicingId, setInvoicingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canManage =
    profile?.role === "admin" || profile?.role === "manager";

  const readyWorkOrders = useMemo(
    () => workOrders.filter((workOrder) => workOrder.status === "ready_for_invoice"),
    [workOrders],
  );

  const reviewSummary = useMemo(() => {
    return readyWorkOrders.reduce(
      (summary, workOrder) => {
        const hasTime = timeEntries.some(
          (entry) =>
            entry.work_order_id === workOrder.id && Number(entry.hours) > 0,
        );
        const hasMaterial = materialEntries.some(
          (entry) => entry.work_order_id === workOrder.id,
        );
        const hasNotes = notes.some(
          (note) => note.work_order_id === workOrder.id,
        );
        const hasPhotos = photos.some(
          (photo) => photo.work_order_id === workOrder.id,
        );
        const hasReadyDraft = invoiceDrafts.some(
          (draft) =>
            draft.work_order_id === workOrder.id && draft.status === "ready",
        );

        return {
          missingDocumentation:
            summary.missingDocumentation + (hasNotes || hasPhotos ? 0 : 1),
          missingMaterial: summary.missingMaterial + (hasMaterial ? 0 : 1),
          missingTime: summary.missingTime + (hasTime ? 0 : 1),
          readyDrafts: summary.readyDrafts + (hasReadyDraft ? 1 : 0),
        };
      },
      {
        missingDocumentation: 0,
        missingMaterial: 0,
        missingTime: 0,
        readyDrafts: 0,
      },
    );
  }, [
    invoiceDrafts,
    materialEntries,
    notes,
    photos,
    readyWorkOrders,
    timeEntries,
  ]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setProfile(null);
      setCustomers([]);
      setSites([]);
      setWorkOrders([]);
      setTimeEntries([]);
      setMaterialEntries([]);
      setNotes([]);
      setPhotos([]);
      setInvoiceDrafts([]);
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
      customersResult,
      sitesResult,
      workOrdersResult,
      timeEntriesResult,
      materialEntriesResult,
      notesResult,
      photosResult,
      invoiceDraftsResult,
    ] = await Promise.all([
      supabase.from("customers").select("*").order("created_at", {
        ascending: false,
      }),
      supabase.from("sites").select("*").order("created_at", {
        ascending: false,
      }),
      supabase
        .from("work_orders")
        .select("*")
        .eq("status", "ready_for_invoice")
        .order("completed_at", { ascending: false, nullsFirst: false }),
      supabase.from("time_entries").select("*").order("created_at", {
        ascending: false,
      }),
      supabase.from("material_entries").select("*").order("created_at", {
        ascending: false,
      }),
      supabase.from("work_order_notes").select("*").order("created_at", {
        ascending: false,
      }),
      supabase.from("work_order_photos").select("*").order("created_at", {
        ascending: false,
      }),
      supabase.from("invoice_drafts").select("*").order("updated_at", {
        ascending: false,
      }),
    ]);

    if (
      customersResult.error ||
      sitesResult.error ||
      workOrdersResult.error ||
      timeEntriesResult.error ||
      materialEntriesResult.error ||
      notesResult.error ||
      photosResult.error ||
      invoiceDraftsResult.error
    ) {
      setError("Kunde inte hämta fakturaunderlag från Supabase.");
      setIsLoading(false);
      return;
    }

    const nextCustomers = (customersResult.data ?? []) as CustomerRow[];
    const nextSites = (sitesResult.data ?? []) as SiteRow[];
    const nextWorkOrders = (workOrdersResult.data ?? []) as WorkOrderRow[];
    const nextTimeEntries = (timeEntriesResult.data ?? []) as TimeEntryRow[];
    const nextMaterialEntries = (materialEntriesResult.data ??
      []) as MaterialEntryRow[];
    const nextNotes = (notesResult.data ?? []) as WorkOrderNoteRow[];
    const nextPhotos = (photosResult.data ?? []) as WorkOrderPhotoRow[];
    const nextInvoiceDrafts = (invoiceDraftsResult.data ??
      []) as InvoiceDraftRow[];

    setProfile(profileResult.data as ProfileRow);
    setCustomers(nextCustomers);
    setSites(nextSites);
    setWorkOrders(nextWorkOrders);
    setTimeEntries(nextTimeEntries);
    setMaterialEntries(nextMaterialEntries);
    setNotes(nextNotes);
    setPhotos(nextPhotos);
    setInvoiceDrafts(nextInvoiceDrafts);
    setDraftTexts((current) => {
      const nextTexts = { ...current };

      nextWorkOrders.forEach((workOrder) => {
        const existingDraft = nextInvoiceDrafts.find(
          (draft) => draft.work_order_id === workOrder.id,
        );

        if (!nextTexts[workOrder.id]) {
          nextTexts[workOrder.id] =
            existingDraft?.invoice_text ??
            buildInvoiceText(
              workOrder,
              nextCustomers.find((customer) => customer.id === workOrder.customer_id),
              nextSites.find((site) => site.id === workOrder.site_id),
              nextTimeEntries.filter(
                (entry) => entry.work_order_id === workOrder.id,
              ),
              nextMaterialEntries.filter(
                (entry) => entry.work_order_id === workOrder.id,
              ),
              nextNotes.filter((note) => note.work_order_id === workOrder.id),
              nextPhotos.filter((photo) => photo.work_order_id === workOrder.id),
            );
        }
      });

      return nextTexts;
    });
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function saveInvoiceDraft(
    workOrder: WorkOrderRow,
    status: InvoiceDraftRow["status"] = "draft",
  ) {
    if (!profile || !canManage) {
      setError("Du behöver vara admin eller manager för att spara fakturaunderlag.");
      return;
    }

    const result = invoiceDraftSchema.safeParse({
      invoiceText: draftTexts[workOrder.id] ?? "",
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Kontrollera fakturatexten.");
      return;
    }

    setSavingId(workOrder.id);
    setError(null);
    setMessage(null);

    const existingDraft = invoiceDrafts.find(
      (draft) => draft.work_order_id === workOrder.id,
    );

    const payload = {
      company_id: workOrder.company_id,
      work_order_id: workOrder.id,
      invoice_text: result.data.invoiceText,
      status,
      created_by: profile.id,
    };

    const saveResult = existingDraft
      ? await supabase
          .from("invoice_drafts")
          .update({
            invoice_text: payload.invoice_text,
            status: payload.status,
          })
          .eq("id", existingDraft.id)
      : await supabase.from("invoice_drafts").insert(payload);

    if (saveResult.error) {
      setError("Kunde inte spara fakturaunderlaget.");
      setSavingId(null);
      return;
    }

    setMessage(
      status === "ready"
        ? `Fakturaunderlag markerat redo för ${workOrder.title}.`
        : `Fakturaunderlag sparat för ${workOrder.title}.`,
    );
    await loadData();
    setSavingId(null);
  }

  async function markWorkOrderInvoiced(workOrder: WorkOrderRow) {
    if (!profile || !canManage) {
      setError("Du behöver vara admin eller manager för att markera fakturerad.");
      return;
    }

    const existingDraft = getInvoiceDraft(workOrder.id);

    if (!existingDraft) {
      setError("Spara ett fakturaunderlag innan arbetsordern markeras fakturerad.");
      return;
    }

    setInvoicingId(workOrder.id);
    setError(null);
    setMessage(null);

    const { error: draftError } = await supabase
      .from("invoice_drafts")
      .update({
        status: "exported",
      })
      .eq("id", existingDraft.id);

    if (draftError) {
      setError(`Kunde inte uppdatera fakturaunderlaget: ${draftError.message}.`);
      setInvoicingId(null);
      return;
    }

    const { error: workOrderError } = await supabase
      .from("work_orders")
      .update({
        status: "invoiced",
      })
      .eq("id", workOrder.id);

    if (workOrderError) {
      setError(`Kunde inte markera arbetsordern fakturerad: ${workOrderError.message}.`);
      setInvoicingId(null);
      return;
    }

    setMessage(`${workOrder.title} markerades som fakturerad.`);
    await loadData();
    setInvoicingId(null);
  }

  function getCustomer(customerId: string) {
    return customers.find((customer) => customer.id === customerId);
  }

  function getSite(siteId: string) {
    return sites.find((site) => site.id === siteId);
  }

  function getTimeEntries(workOrderId: string) {
    return timeEntries.filter((entry) => entry.work_order_id === workOrderId);
  }

  function getMaterialEntries(workOrderId: string) {
    return materialEntries.filter((entry) => entry.work_order_id === workOrderId);
  }

  function getNotes(workOrderId: string) {
    return notes.filter((note) => note.work_order_id === workOrderId);
  }

  function getPhotos(workOrderId: string) {
    return photos.filter((photo) => photo.work_order_id === workOrderId);
  }

  function getInvoiceDraft(workOrderId: string) {
    return invoiceDrafts.find((draft) => draft.work_order_id === workOrderId);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <p className="text-sm font-medium text-action">Fakturaunderlag</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">
          Skapa underlag från klara jobb
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Välj en arbetsorder som är klar för fakturering, kontrollera
          rapporterad tid och material och spara fakturatexten. MVP:t skickar
          inga riktiga fakturor.
        </p>
      </section>

      {!profile ? (
        <section className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">
            Logga in för att skapa fakturaunderlag
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Fakturaunderlag är begränsat till admin och manager via RLS.
          </p>
        </section>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}

      <section className="rounded-lg border border-line bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Arbetsordrar att fakturera
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Visar arbetsordrar med status “Klar för fakturering”.
            </p>
          </div>
          <span className="inline-flex min-h-8 items-center rounded-full border border-line px-3 text-sm font-medium text-slate-700">
            {isLoading ? "Laddar" : `${readyWorkOrders.length} redo`}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-line bg-field p-3">
            <p className="text-sm text-slate-600">Redo underlag</p>
            <p className="mt-1 text-2xl font-semibold text-ink">
              {reviewSummary.readyDrafts}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-field p-3">
            <p className="text-sm text-slate-600">Saknar tid</p>
            <p className="mt-1 text-2xl font-semibold text-ink">
              {reviewSummary.missingTime}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-field p-3">
            <p className="text-sm text-slate-600">Saknar material</p>
            <p className="mt-1 text-2xl font-semibold text-ink">
              {reviewSummary.missingMaterial}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-field p-3">
            <p className="text-sm text-slate-600">Saknar dokumentation</p>
            <p className="mt-1 text-2xl font-semibold text-ink">
              {reviewSummary.missingDocumentation}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {!isLoading && readyWorkOrders.length === 0 ? (
            <p className="rounded-lg border border-line bg-field px-3 py-3 text-sm text-slate-600">
              Inga arbetsordrar är klara för fakturering just nu. Markera ett
              klart jobb i arbetsordervyn först.
            </p>
          ) : null}

          {isLoading
            ? Array.from({ length: 2 }).map((_, index) => (
                <div
                  className="h-72 rounded-lg border border-line bg-field"
                  key={index}
                />
              ))
            : readyWorkOrders.map((workOrder) => {
                const customer = getCustomer(workOrder.customer_id);
                const site = getSite(workOrder.site_id);
                const jobTimeEntries = getTimeEntries(workOrder.id);
                const jobMaterialEntries = getMaterialEntries(workOrder.id);
                const jobNotes = getNotes(workOrder.id);
                const jobPhotos = getPhotos(workOrder.id);
                const existingDraft = getInvoiceDraft(workOrder.id);
                const totalHours = jobTimeEntries.reduce(
                  (sum, entry) => sum + Number(entry.hours),
                  0,
                );
                const missingTime = totalHours <= 0;
                const missingMaterial = jobMaterialEntries.length === 0;
                const missingDocumentation =
                  jobNotes.length === 0 && jobPhotos.length === 0;

                return (
                  <article
                    className="rounded-lg border border-line bg-field p-4"
                    key={workOrder.id}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {customer?.name ?? "Kund saknas"} ·{" "}
                          {site
                            ? `${site.address}${site.city ? `, ${site.city}` : ""}`
                            : "Arbetsplats saknas"}
                        </p>
                        <h3 className="mt-1 text-xl font-semibold text-ink">
                          {workOrder.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {workOrder.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={workOrder.status} />
                        {existingDraft ? (
                          <span className="inline-flex min-h-8 items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 text-sm font-medium text-emerald-900">
                            {invoiceDraftStatusLabels[existingDraft.status]}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-line bg-white p-3">
                        <p className="text-sm text-slate-600">Klar</p>
                        <p className="mt-1 text-sm font-semibold text-ink">
                          {formatDate(workOrder.completed_at)}
                        </p>
                      </div>
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
                    </div>

                    {missingTime || missingMaterial || missingDocumentation ? (
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
                        {missingDocumentation ? (
                          <span className="inline-flex min-h-8 items-center rounded-full border border-amber-200 bg-amber-50 px-3 text-sm font-medium text-amber-900">
                            Saknar dokumentation
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
                        Tid, material och dokumentation finns.
                      </p>
                    )}

                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      <section className="rounded-lg border border-line bg-white p-3">
                        <h4 className="text-sm font-semibold text-ink">
                          Rapporterad tid
                        </h4>
                        <div className="mt-3 space-y-2">
                          {jobTimeEntries.length === 0 ? (
                            <p className="text-sm text-slate-600">
                              Ingen tid rapporterad.
                            </p>
                          ) : (
                            jobTimeEntries.map((entry) => (
                              <p
                                className="rounded-lg border border-line bg-field px-3 py-2 text-sm text-slate-700"
                                key={entry.id}
                              >
                                <span className="font-semibold text-ink">
                                  {Number(entry.hours).toLocaleString("sv-SE")} h
                                </span>
                                {entry.description ? ` · ${entry.description}` : ""}
                              </p>
                            ))
                          )}
                        </div>
                      </section>

                      <section className="rounded-lg border border-line bg-white p-3">
                        <h4 className="text-sm font-semibold text-ink">
                          Rapporterat material
                        </h4>
                        <div className="mt-3 space-y-2">
                          {jobMaterialEntries.length === 0 ? (
                            <p className="text-sm text-slate-600">
                              Inget material rapporterat.
                            </p>
                          ) : (
                            jobMaterialEntries.map((entry) => (
                              <p
                                className="rounded-lg border border-line bg-field px-3 py-2 text-sm text-slate-700"
                                key={entry.id}
                              >
                                <span className="font-semibold text-ink">
                                  {entry.name}
                                </span>{" "}
                                {Number(entry.quantity).toLocaleString("sv-SE")}{" "}
                                {entry.unit}
                              </p>
                            ))
                          )}
                        </div>
                      </section>
                    </div>

                    <section className="mt-4 rounded-lg border border-line bg-white p-3">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-sm font-semibold text-ink">
                          Anteckningar
                        </h4>
                        <span className="text-sm font-medium text-slate-600">
                          {jobNotes.length} st
                        </span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {jobNotes.length === 0 ? (
                          <p className="text-sm text-slate-600">
                            Inga anteckningar finns på arbetsordern.
                          </p>
                        ) : (
                          jobNotes.map((note) => (
                            <p
                              className="rounded-lg border border-line bg-field px-3 py-2 text-sm leading-6 text-slate-700"
                              key={note.id}
                            >
                              {note.note}
                            </p>
                          ))
                        )}
                      </div>
                    </section>

                    <section className="mt-4 rounded-lg border border-line bg-white p-3">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-sm font-semibold text-ink">
                          Fotodokumentation
                        </h4>
                        <span className="text-sm font-medium text-slate-600">
                          {jobPhotos.length} st
                        </span>
                      </div>
                      <div className="mt-3">
                        <WorkOrderPhotoGallery
                          emptyText="Inga foton finns på arbetsordern."
                          maxPhotos={4}
                          photos={jobPhotos}
                        />
                      </div>
                    </section>

                    <label className="mt-4 block">
                      <span className="text-sm font-semibold text-ink">
                        Fakturatext
                      </span>
                      <textarea
                        className="mt-2 min-h-56 w-full rounded-lg border border-line bg-white px-3 py-2 text-base leading-6 outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                        disabled={!canManage || savingId === workOrder.id}
                        onChange={(event) =>
                          setDraftTexts((current) => ({
                            ...current,
                            [workOrder.id]: event.target.value,
                          }))
                        }
                        value={draftTexts[workOrder.id] ?? ""}
                      />
                    </label>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button
                        className="min-h-12 w-full rounded-lg border border-line bg-white px-4 text-base font-semibold text-ink hover:border-action disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        disabled={!canManage || savingId === workOrder.id}
                        onClick={() => saveInvoiceDraft(workOrder)}
                        type="button"
                      >
                        {savingId === workOrder.id
                          ? "Sparar"
                          : existingDraft
                            ? "Spara som utkast"
                            : "Spara fakturaunderlag"}
                      </button>
                      <button
                        className="min-h-12 w-full rounded-lg bg-action px-4 text-base font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        disabled={!canManage || savingId === workOrder.id}
                        onClick={() => saveInvoiceDraft(workOrder, "ready")}
                        type="button"
                      >
                        {savingId === workOrder.id
                          ? "Sparar"
                          : "Markera underlag redo"}
                      </button>
                      <button
                        className="min-h-12 w-full rounded-lg border border-line bg-white px-4 text-base font-semibold text-ink hover:border-action disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        disabled={
                          !canManage ||
                          !existingDraft ||
                          savingId === workOrder.id ||
                          invoicingId === workOrder.id
                        }
                        onClick={() => markWorkOrderInvoiced(workOrder)}
                        type="button"
                      >
                        {invoicingId === workOrder.id
                          ? "Markerar"
                          : "Markera fakturerad"}
                      </button>
                    </div>
                  </article>
                );
              })}
        </div>
      </section>
    </div>
  );
}
