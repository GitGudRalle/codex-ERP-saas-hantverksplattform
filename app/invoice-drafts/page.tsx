import { PagePlaceholder } from "@/components/page-placeholder";

export default function InvoiceDraftsPage() {
  return (
    <PagePlaceholder
      eyebrow="Fakturaunderlag"
      title="Granska innan faktura"
      description="Fakturaunderlag väntar tills tid, material, anteckningar och foton finns på arbetsordern. MVP:t skickar inga riktiga fakturor."
      actions={["Flagga saknad tid", "Flagga saknat material", "Skriv fakturatext"]}
    />
  );
}
