import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elfirma",
  description: "Operativ plattform för små svenska elföretag.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="sv">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
