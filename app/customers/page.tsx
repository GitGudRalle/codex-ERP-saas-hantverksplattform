import { PagePlaceholder } from "@/components/page-placeholder";

export default function CustomersPage() {
  return (
    <PagePlaceholder
      eyebrow="Kunder"
      title="Kundregister"
      description="Här kommer admin och ansvarig kunna hitta befintliga kunder, lägga till nya kunder och koppla adresser eller arbetsplatser."
      actions={["Sök kund", "Skapa kund", "Lägg till arbetsplats"]}
    />
  );
}
