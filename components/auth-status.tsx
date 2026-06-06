"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthStatus() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (isMounted) {
        setUser(data.user);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (isLoading) {
    return (
      <div className="rounded-full border border-line px-3 py-1 text-sm font-medium text-slate-500">
        Laddar
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        className="rounded-full bg-action px-4 py-2 text-sm font-semibold text-white"
        href="/login"
      >
        Logga in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-44 truncate text-sm text-slate-600 sm:block">
        {user.email}
      </span>
      <button
        className="rounded-full border border-line px-3 py-2 text-sm font-semibold text-ink hover:border-action"
        onClick={signOut}
        type="button"
      >
        Logga ut
      </button>
    </div>
  );
}
