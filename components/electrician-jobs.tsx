"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { WorkOrderPhotoGallery } from "@/components/work-order-photo-gallery";
import {
  nextFieldStatuses,
  workOrderStatusLabels,
  type WorkOrderStatus,
} from "@/lib/domain";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  CustomerRow,
  MaterialEntryRow,
  ProfileRow,
  SiteRow,
  TimeEntryRow,
  WorkOrderNoteRow,
  WorkOrderPhotoRow,
  WorkOrderRow,
} from "@/lib/supabase/types";
import {
  materialEntrySchema,
  timeEntrySchema,
  workOrderNoteSchema,
} from "@/lib/validation";

const photoBucket = "work-order-photos";
const maxPhotoSizeBytes = 10 * 1024 * 1024;
const allowedPhotoMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/octet-stream",
]);

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

function getPhotoMimeType(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "jpg" || extension === "jpeg") {
    return "image/jpeg";
  }

  if (extension === "png") {
    return "image/png";
  }

  if (extension === "webp") {
    return "image/webp";
  }

  if (extension === "heic") {
    return "image/heic";
  }

  if (extension === "heif") {
    return "image/heif";
  }

  if (file.type) {
    return file.type;
  }

  return "";
}

function getPhotoExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension && ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(extension)) {
    return extension === "jpeg" ? "jpg" : extension;
  }

  const mimeType = getPhotoMimeType(file);

  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  if (mimeType === "image/heic") {
    return "heic";
  }

  if (mimeType === "image/heif") {
    return "heif";
  }

  return "jpg";
}

export function ElectricianJobs() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderRow[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntryRow[]>([]);
  const [materialEntries, setMaterialEntries] = useState<MaterialEntryRow[]>([]);
  const [workOrderNotes, setWorkOrderNotes] = useState<WorkOrderNoteRow[]>([]);
  const [workOrderPhotos, setWorkOrderPhotos] = useState<WorkOrderPhotoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [savingTimeId, setSavingTimeId] = useState<string | null>(null);
  const [savingMaterialId, setSavingMaterialId] = useState<string | null>(null);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [savingPhotoId, setSavingPhotoId] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
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
      setWorkOrderNotes([]);
      setWorkOrderPhotos([]);
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
      workOrdersResult,
      customersResult,
      sitesResult,
      timeEntriesResult,
      materialEntriesResult,
      notesResult,
      photosResult,
    ] = await Promise.all([
      supabase.from("work_orders").select("*").order("scheduled_start", {
        ascending: true,
        nullsFirst: false,
      }),
      supabase.from("customers").select("*"),
      supabase.from("sites").select("*"),
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
    ]);

    if (
      workOrdersResult.error ||
      customersResult.error ||
      sitesResult.error ||
      timeEntriesResult.error ||
      materialEntriesResult.error ||
      notesResult.error ||
      photosResult.error
    ) {
      setError("Kunde inte hämta tilldelade jobb och rapporter från Supabase.");
      setIsLoading(false);
      return;
    }

    setProfile(profileResult.data as ProfileRow);
    setWorkOrders((workOrdersResult.data ?? []) as WorkOrderRow[]);
    setCustomers((customersResult.data ?? []) as CustomerRow[]);
    setSites((sitesResult.data ?? []) as SiteRow[]);
    setTimeEntries((timeEntriesResult.data ?? []) as TimeEntryRow[]);
    setMaterialEntries((materialEntriesResult.data ?? []) as MaterialEntryRow[]);
    setWorkOrderNotes((notesResult.data ?? []) as WorkOrderNoteRow[]);
    setWorkOrderPhotos((photosResult.data ?? []) as WorkOrderPhotoRow[]);
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

  async function addTimeEntry(workOrder: WorkOrderRow, formData: FormData) {
    if (!profile) {
      setError("Logga in för att rapportera tid.");
      return false;
    }

    const result = timeEntrySchema.safeParse({
      hours: formData.get("hours"),
      description:
        typeof formData.get("description") === "string"
          ? formData.get("description")
          : "",
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Kontrollera tiden.");
      return false;
    }

    setSavingTimeId(workOrder.id);
    setError(null);

    const { error: insertError } = await supabase.from("time_entries").insert({
      company_id: workOrder.company_id,
      work_order_id: workOrder.id,
      electrician_id: profile.id,
      hours: result.data.hours,
      description: result.data.description?.trim() || null,
    });

    if (insertError) {
      setError("Kunde inte spara tid. Kontrollera att jobbet är tilldelat dig.");
      setSavingTimeId(null);
      return false;
    }

    await loadJobs();
    setSavingTimeId(null);
    return true;
  }

  async function addMaterialEntry(workOrder: WorkOrderRow, formData: FormData) {
    if (!profile) {
      setError("Logga in för att rapportera material.");
      return false;
    }

    const result = materialEntrySchema.safeParse({
      name: formData.get("name"),
      quantity: formData.get("quantity"),
      unit: formData.get("unit") || "st",
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Kontrollera materialet.");
      return false;
    }

    setSavingMaterialId(workOrder.id);
    setError(null);

    const { error: insertError } = await supabase
      .from("material_entries")
      .insert({
        company_id: workOrder.company_id,
        work_order_id: workOrder.id,
        added_by: profile.id,
        name: result.data.name.trim(),
        quantity: result.data.quantity,
        unit: result.data.unit.trim(),
      });

    if (insertError) {
      setError(
        "Kunde inte spara material. Kontrollera att jobbet är tilldelat dig.",
      );
      setSavingMaterialId(null);
      return false;
    }

    await loadJobs();
    setSavingMaterialId(null);
    return true;
  }

  async function addWorkOrderNote(workOrder: WorkOrderRow, formData: FormData) {
    if (!profile) {
      setError("Logga in för att skriva anteckning.");
      return false;
    }

    const result = workOrderNoteSchema.safeParse({
      note: formData.get("note"),
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Kontrollera anteckningen.");
      return false;
    }

    setSavingNoteId(workOrder.id);
    setError(null);

    const { error: insertError } = await supabase
      .from("work_order_notes")
      .insert({
        company_id: workOrder.company_id,
        work_order_id: workOrder.id,
        author_id: profile.id,
        note: result.data.note.trim(),
      });

    if (insertError) {
      setError(
        "Kunde inte spara anteckning. Kontrollera att jobbet är tilldelat dig.",
      );
      setSavingNoteId(null);
      return false;
    }

    await loadJobs();
    setSavingNoteId(null);
    return true;
  }

  async function addWorkOrderPhoto(workOrder: WorkOrderRow, formData: FormData) {
    if (!profile) {
      setError("Logga in för att ladda upp foto.");
      return false;
    }

    const file = formData.get("photo");
    const caption =
      typeof formData.get("caption") === "string"
        ? formData.get("caption")?.toString().trim()
        : "";

    if (!(file instanceof File) || file.size === 0) {
      setError("Välj ett foto att ladda upp.");
      return false;
    }

    const mimeType = getPhotoMimeType(file);
    const extension = getPhotoExtension(file);

    if (!allowedPhotoMimeTypes.has(mimeType)) {
      setError("Fotot behöver vara JPG, PNG, WebP, HEIC eller HEIF.");
      return false;
    }

    if (file.size > maxPhotoSizeBytes) {
      setError("Fotot är för stort. Maxstorlek är 10 MB.");
      return false;
    }

    setSavingPhotoId(workOrder.id);
    setError(null);

    const storagePath = `${workOrder.company_id}/${workOrder.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(photoBucket)
      .upload(storagePath, file, {
        cacheControl: "3600",
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      setError(
        `Kunde inte ladda upp fotot: ${uploadError.message}. Kontrollera att migration 007 är körd i Supabase.`,
      );
      setSavingPhotoId(null);
      return false;
    }

    const { error: insertError } = await supabase
      .from("work_order_photos")
      .insert({
        company_id: workOrder.company_id,
        work_order_id: workOrder.id,
        uploaded_by: profile.id,
        storage_path: storagePath,
        caption: caption || null,
      });

    if (insertError) {
      await supabase.storage.from(photoBucket).remove([storagePath]);
      setError(
        `Fotot laddades upp, men kunde inte kopplas till arbetsordern: ${insertError.message}.`,
      );
      setSavingPhotoId(null);
      return false;
    }

    await loadJobs();
    setSavingPhotoId(null);
    return true;
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

  function getWorkOrderNotes(workOrderId: string) {
    return workOrderNotes.filter((entry) => entry.work_order_id === workOrderId);
  }

  function getWorkOrderPhotos(workOrderId: string) {
    return workOrderPhotos.filter((entry) => entry.work_order_id === workOrderId);
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
              const jobTimeEntries = getTimeEntries(job.id);
              const jobMaterialEntries = getMaterialEntries(job.id);
              const jobNotes = getWorkOrderNotes(job.id);
              const jobPhotos = getWorkOrderPhotos(job.id);
              const totalHours = jobTimeEntries.reduce(
                (sum, entry) => sum + Number(entry.hours),
                0,
              );
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

                    <section className="rounded-lg border border-line bg-field p-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-ink">
                          Anteckningar
                        </h3>
                        <span className="text-sm font-medium text-slate-600">
                          {jobNotes.length} st
                        </span>
                      </div>
                      <form
                        className="mt-3 grid gap-2"
                        onSubmit={async (event) => {
                          event.preventDefault();
                          const wasSaved = await addWorkOrderNote(
                            job,
                            new FormData(event.currentTarget),
                          );
                          if (wasSaved) {
                            event.currentTarget.reset();
                          }
                        }}
                      >
                        <label>
                          <span className="sr-only">Anteckning</span>
                          <textarea
                            className="min-h-24 w-full rounded-lg border border-line px-3 py-2 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                            name="note"
                            placeholder="Skriv kort vad kunden sa, vad som saknas eller vad nästa montör behöver veta."
                          />
                        </label>
                        <button
                          className="min-h-11 rounded-lg bg-action px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={savingNoteId === job.id}
                        >
                          {savingNoteId === job.id
                            ? "Sparar"
                            : "Spara anteckning"}
                        </button>
                      </form>
                      <div className="mt-3 space-y-2">
                        {jobNotes.length === 0 ? (
                          <p className="text-sm text-slate-600">
                            Inga anteckningar ännu.
                          </p>
                        ) : (
                          jobNotes.map((entry) => (
                            <div
                              className="rounded-lg border border-line bg-white px-3 py-2 text-sm"
                              key={entry.id}
                            >
                              <p className="text-slate-700">{entry.note}</p>
                              <p className="mt-2 text-xs font-medium text-slate-500">
                                {new Intl.DateTimeFormat("sv-SE", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }).format(new Date(entry.created_at))}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </section>

                    <section className="rounded-lg border border-line bg-field p-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-ink">
                          Foton
                        </h3>
                        <span className="text-sm font-medium text-slate-600">
                          {jobPhotos.length} st
                        </span>
                      </div>
                      <form
                        className="mt-3 grid gap-2"
                        onSubmit={async (event) => {
                          event.preventDefault();
                          const wasSaved = await addWorkOrderPhoto(
                            job,
                            new FormData(event.currentTarget),
                          );
                          if (wasSaved) {
                            event.currentTarget.reset();
                          }
                        }}
                      >
                        <label className="block">
                          <span className="mb-1 block text-sm font-medium text-slate-700">
                            Välj eller ta foto
                          </span>
                          <input
                            accept="image/*,.heic,.heif"
                            className="block min-h-12 w-full rounded-lg border border-line bg-white px-3 py-2 text-base file:mr-3 file:rounded-lg file:border-0 file:bg-action file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                            name="photo"
                            type="file"
                          />
                        </label>
                        <label>
                          <span className="sr-only">Bildtext</span>
                          <input
                            className="min-h-11 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                            name="caption"
                            placeholder="Kort bildtext, ex. Före byte av uttag"
                          />
                        </label>
                        <button
                          className="min-h-11 rounded-lg bg-action px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={savingPhotoId === job.id}
                        >
                          {savingPhotoId === job.id
                            ? "Laddar upp"
                            : "Ladda upp foto"}
                        </button>
                      </form>
                      <div className="mt-3">
                        <WorkOrderPhotoGallery photos={jobPhotos} maxPhotos={4} />
                      </div>
                    </section>

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
                      <Link
                        className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-action"
                        href={`/work-orders/${job.id}`}
                      >
                        Öppna detalj
                      </Link>
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
                      <div className="flex min-h-12 items-center justify-center rounded-lg border border-line bg-field px-3 text-center text-sm font-semibold text-ink">
                        {totalHours.toLocaleString("sv-SE")} h
                      </div>
                      <div className="flex min-h-12 items-center justify-center rounded-lg border border-line bg-field px-3 text-center text-sm font-semibold text-ink">
                        {jobMaterialEntries.length} material
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <section className="rounded-lg border border-line bg-field p-3">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-ink">
                            Tid
                          </h3>
                          <span className="text-sm font-medium text-slate-600">
                            {totalHours.toLocaleString("sv-SE")} h
                          </span>
                        </div>
                        <form
                          className="mt-3 grid gap-2"
                          onSubmit={async (event) => {
                            event.preventDefault();
                            const wasSaved = await addTimeEntry(
                              job,
                              new FormData(event.currentTarget),
                            );
                            if (wasSaved) {
                              event.currentTarget.reset();
                            }
                          }}
                        >
                          <div className="grid grid-cols-[110px_1fr] gap-2">
                            <label>
                              <span className="sr-only">Timmar</span>
                              <input
                                className="min-h-11 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                                inputMode="decimal"
                                min="0.25"
                                name="hours"
                                placeholder="1,5 h"
                                step="0.25"
                                type="number"
                              />
                            </label>
                            <label>
                              <span className="sr-only">Beskrivning</span>
                              <input
                                className="min-h-11 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                                name="description"
                                placeholder="Vad gjordes?"
                              />
                            </label>
                          </div>
                          <button
                            className="min-h-11 rounded-lg bg-action px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={savingTimeId === job.id}
                          >
                            {savingTimeId === job.id ? "Sparar" : "Spara tid"}
                          </button>
                        </form>
                        <div className="mt-3 space-y-2">
                          {jobTimeEntries.length === 0 ? (
                            <p className="text-sm text-slate-600">
                              Ingen tid rapporterad ännu.
                            </p>
                          ) : (
                            jobTimeEntries.map((entry) => (
                              <div
                                className="rounded-lg border border-line bg-white px-3 py-2 text-sm"
                                key={entry.id}
                              >
                                <p className="font-semibold text-ink">
                                  {Number(entry.hours).toLocaleString("sv-SE")} h
                                </p>
                                {entry.description ? (
                                  <p className="mt-1 text-slate-600">
                                    {entry.description}
                                  </p>
                                ) : null}
                              </div>
                            ))
                          )}
                        </div>
                      </section>

                      <section className="rounded-lg border border-line bg-field p-3">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-ink">
                            Material
                          </h3>
                          <span className="text-sm font-medium text-slate-600">
                            {jobMaterialEntries.length} rader
                          </span>
                        </div>
                        <form
                          className="mt-3 grid gap-2"
                          onSubmit={async (event) => {
                            event.preventDefault();
                            const wasSaved = await addMaterialEntry(
                              job,
                              new FormData(event.currentTarget),
                            );
                            if (wasSaved) {
                              event.currentTarget.reset();
                            }
                          }}
                        >
                          <label>
                            <span className="sr-only">Material</span>
                            <input
                              className="min-h-11 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                              name="name"
                              placeholder="Ex. vägguttag, kabel, klammer"
                            />
                          </label>
                          <div className="grid grid-cols-[1fr_90px] gap-2">
                            <label>
                              <span className="sr-only">Antal</span>
                              <input
                                className="min-h-11 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                                inputMode="decimal"
                                min="0.01"
                                name="quantity"
                                placeholder="Antal"
                                step="0.01"
                                type="number"
                              />
                            </label>
                            <label>
                              <span className="sr-only">Enhet</span>
                              <input
                                className="min-h-11 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
                                defaultValue="st"
                                name="unit"
                              />
                            </label>
                          </div>
                          <button
                            className="min-h-11 rounded-lg bg-action px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={savingMaterialId === job.id}
                          >
                            {savingMaterialId === job.id
                              ? "Sparar"
                              : "Spara material"}
                          </button>
                        </form>
                        <div className="mt-3 space-y-2">
                          {jobMaterialEntries.length === 0 ? (
                            <p className="text-sm text-slate-600">
                              Inget material rapporterat ännu.
                            </p>
                          ) : (
                            jobMaterialEntries.map((entry) => (
                              <div
                                className="rounded-lg border border-line bg-white px-3 py-2 text-sm"
                                key={entry.id}
                              >
                                <p className="font-semibold text-ink">
                                  {entry.name}
                                </p>
                                <p className="mt-1 text-slate-600">
                                  {Number(entry.quantity).toLocaleString(
                                    "sv-SE",
                                  )}{" "}
                                  {entry.unit}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </section>
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
