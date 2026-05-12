import { PagePlaceholder } from "@/components/page-placeholder";

export default function WorkOrdersPage() {
  return (
    <PagePlaceholder
      eyebrow="Arbetsordrar"
      title="Planera och följ jobb"
      description="Här samlas arbetsordrar från första kundärende till klart jobb. Fokus är tydlig status, ansvarig montör och nästa praktiska steg."
      actions={["Skapa arbetsorder", "Tilldela montör", "Granska klart jobb"]}
    />
  );
}
