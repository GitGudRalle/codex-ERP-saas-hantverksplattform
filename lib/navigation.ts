import type { ProfileRow } from "@/lib/supabase/types";

export type NavigationRole = ProfileRow["role"] | "guest";

export const navigationItems = [
  { href: "/", label: "Dashboard", roles: ["admin", "manager"] },
  { href: "/customers", label: "Kunder", roles: ["admin", "manager"] },
  { href: "/work-orders", label: "Arbetsordrar", roles: ["admin", "manager"] },
  { href: "/jobs", label: "Mina jobb", roles: ["admin", "manager", "electrician"] },
  { href: "/invoice-drafts", label: "Fakturaunderlag", roles: ["admin", "manager"] },
] as const;

export function getNavigationItems(role: NavigationRole) {
  return navigationItems.filter((item) =>
    (item.roles as readonly NavigationRole[]).includes(role),
  );
}
