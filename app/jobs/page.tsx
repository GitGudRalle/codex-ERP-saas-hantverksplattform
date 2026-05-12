import { PagePlaceholder } from "@/components/page-placeholder";

export default function JobsPage() {
  return (
    <PagePlaceholder
      eyebrow="Mina jobb"
      title="Montörens mobilvy"
      description="Här ska elektrikern snabbt se dagens tilldelade jobb, ringa kund, öppna adress, rapportera tid och material samt markera jobbet klart."
      actions={["Ring kund", "Öppna karta", "Rapportera tid", "Lägg till material"]}
    />
  );
}
