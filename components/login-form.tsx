"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError("Kunde inte logga in. Kontrollera e-post och lösenord.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <form
      className="mx-auto max-w-md rounded-lg border border-line bg-white p-5 shadow-soft"
      onSubmit={signIn}
    >
      <p className="text-sm font-medium text-action">Inloggning</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">
        Logga in i Elfirma
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Använd testkontot från Supabase Authentication. Efter inloggning styr
        RLS vilken företagsdata du kan se.
      </p>

      <label className="mt-5 block">
        <span className="text-sm font-medium text-slate-700">E-post</span>
        <input
          autoComplete="email"
          className="mt-1 min-h-12 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@admin.com"
          type="email"
          value={email}
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">Lösenord</span>
        <input
          autoComplete="current-password"
          className="mt-1 min-h-12 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-action focus:ring-2 focus:ring-action/20"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Ditt lösenord"
          type="password"
          value={password}
        />
      </label>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <button
        className="mt-5 min-h-12 w-full rounded-lg bg-action px-4 text-base font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Loggar in" : "Logga in"}
      </button>
    </form>
  );
}
