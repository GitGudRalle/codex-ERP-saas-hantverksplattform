"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { AuthStatus } from "@/components/auth-status";
import { getNavigationItems, type NavigationRole } from "@/lib/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [role, setRole] = useState<NavigationRole>("guest");
  const navItems = getNavigationItems(role);

  useEffect(() => {
    let isMounted = true;

    async function loadRole() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        if (isMounted) {
          setRole("guest");
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (isMounted) {
        setRole(profile?.role ?? "guest");
      }
    }

    loadRole();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadRole();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <div className="min-h-screen bg-field">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link className="min-w-0" href="/">
              <p className="text-lg font-semibold text-ink">Elfirma</p>
              <p className="text-sm text-slate-500">Ljungqvist Elservice AB</p>
            </Link>
            <AuthStatus />
          </div>
          <nav aria-label="Huvudnavigation">
            <ul className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    className="flex min-h-12 items-center rounded-lg border border-line bg-field px-3 text-sm font-medium text-ink transition hover:border-action hover:bg-white focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
