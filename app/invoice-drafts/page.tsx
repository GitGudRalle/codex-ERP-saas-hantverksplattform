import { PagePlaceholder } from "@/components/page-placeholder";

export default function InvoiceDraftsPage() {
  return (
    <PagePlaceholder
      eyebrow="Fakturaunderlag"
      title="Granska innan faktura"
      description="Här granskar admin eller ansvarig rapporterad tid, material, anteckningar och foton innan underlaget förs vidare till ekonomisystemet."
      actions={["Granska tid", "Granska material", "Skapa underlag"]}
    />
  );
}
