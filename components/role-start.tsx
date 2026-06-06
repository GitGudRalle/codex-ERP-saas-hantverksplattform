"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/lib/supabase/types";

export function RoleStart() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fallbackTimer = window.setTimeout(() => {
      if (isMounted) {
        setProfile(null);
        setIsLoading(false);
      }
    }, 3000);

    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        if (isMounted) {
          setProfile(null);
          setIsLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (isMounted) {
        setProfile((data as ProfileRow | null) ?? null);
        setIsLoading(false);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
      window.clearTimeout(fallbackTimer);
    };
  }, [supabase]);

  if (isLoading) {
    return (
      <section className="rounded-lg border border-line bg-white p-5">
        <p className="text-sm font-medium text-slate-600">Laddar startvy...</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">Logga in för att börja</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          När du är inloggad visar appen rätt arbetsyta för din roll.
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

  if (profile.role === "electrician") {
    return (
      <section className="rounded-lg border border-line bg-white p-5">
        <p className="text-sm font-medium text-action">Montör</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">
          Fortsätt direkt till dina jobb
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Här finns dagens tilldelade arbetsordrar, kundens telefon, adress,
          status, tid, material och anteckningar.
        </p>
        <Link
          className="mt-4 inline-flex min-h-12 items-center rounded-lg bg-action px-4 text-base font-semibold text-white"
          href="/jobs"
        >
          Öppna Mina jobb
        </Link>
      </section>
    );
  }

  return null;
}
