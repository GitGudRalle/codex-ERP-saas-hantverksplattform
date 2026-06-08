"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { WorkOrderPhotoRow } from "@/lib/supabase/types";

type WorkOrderPhotoGalleryProps = {
  photos: WorkOrderPhotoRow[];
  emptyText?: string;
  maxPhotos?: number;
};

const photoBucket = "work-order-photos";

export function WorkOrderPhotoGallery({
  photos,
  emptyText = "Inga foton uppladdade ännu.",
  maxPhotos,
}: WorkOrderPhotoGalleryProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [failedPreviews, setFailedPreviews] = useState<Record<string, boolean>>(
    {},
  );
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const visiblePhotos = useMemo(
    () => (maxPhotos ? photos.slice(0, maxPhotos) : photos),
    [maxPhotos, photos],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadSignedUrls() {
      if (visiblePhotos.length === 0) {
        setSignedUrls({});
        return;
      }

      const { data } = await supabase.storage
        .from(photoBucket)
        .createSignedUrls(
          visiblePhotos.map((photo) => photo.storage_path),
          60 * 30,
        );

      if (!isMounted) {
        return;
      }

      const nextUrls: Record<string, string> = {};

      (data ?? []).forEach((item) => {
        if (item.path && item.signedUrl) {
          nextUrls[item.path] = item.signedUrl;
        }
      });

      setSignedUrls(nextUrls);
    }

    loadSignedUrls();

    return () => {
      isMounted = false;
    };
  }, [supabase, visiblePhotos]);

  if (photos.length === 0) {
    return <p className="text-sm text-slate-600">{emptyText}</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {visiblePhotos.map((photo) => {
        const signedUrl = signedUrls[photo.storage_path];
        const extension = photo.storage_path.split(".").pop()?.toLowerCase();
        const cannotPreview =
          failedPreviews[photo.storage_path] ||
          extension === "heic" ||
          extension === "heif";

        return (
          <article
            className="overflow-hidden rounded-lg border border-line bg-white"
            key={photo.id}
          >
            {signedUrl && !cannotPreview ? (
              <a href={signedUrl} rel="noreferrer" target="_blank">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={photo.caption ?? "Dokumentationsfoto"}
                  className="aspect-[4/3] w-full bg-field object-cover"
                  loading="lazy"
                  onError={() =>
                    setFailedPreviews((current) => ({
                      ...current,
                      [photo.storage_path]: true,
                    }))
                  }
                  src={signedUrl}
                />
              </a>
            ) : signedUrl ? (
              <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 bg-field px-4 text-center">
                <p className="text-sm font-semibold text-ink">
                  Förhandsvisning saknas
                </p>
                <p className="text-sm text-slate-600">
                  Fotot är uppladdat, men den här filtypen kan inte visas i
                  webbläsaren.
                </p>
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-field px-3 text-center text-sm text-slate-600">
                Hämtar foto...
              </div>
            )}
            <div className="p-3">
              <p className="text-sm font-medium text-ink">
                {photo.caption || "Dokumentationsfoto"}
              </p>
              {signedUrl ? (
                <a
                  className="mt-2 inline-flex min-h-9 items-center rounded-lg border border-line px-3 text-sm font-semibold text-ink hover:border-action"
                  href={signedUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Öppna foto
                </a>
              ) : null}
            </div>
          </article>
        );
      })}
      {maxPhotos && photos.length > maxPhotos ? (
        <p className="text-sm font-medium text-slate-600">
          +{photos.length - maxPhotos} fler foton i arbetsorderdetaljen.
        </p>
      ) : null}
    </div>
  );
}
