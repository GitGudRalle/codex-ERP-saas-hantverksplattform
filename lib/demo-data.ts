import type { Customer, Electrician, Site, WorkOrder } from "@/lib/domain";

export const electricians: Electrician[] = [
  { id: "montor-1", name: "Erik Andersson", phone: "070-123 45 01" },
  { id: "montor-2", name: "Sara Nilsson", phone: "070-123 45 02" },
  { id: "montor-3", name: "Ali Hassan", phone: "070-123 45 03" },
];

export const initialCustomers: Customer[] = [
  {
    id: "kund-1",
    name: "Anna Karlsson",
    phone: "070-555 12 34",
    email: "anna@example.se",
    type: "private",
  },
  {
    id: "kund-2",
    name: "BRF Eken",
    phone: "08-555 44 33",
    email: "styrelse@brfeken.se",
    type: "brf",
  },
];

export const initialSites: Site[] = [
  {
    id: "plats-1",
    customerId: "kund-1",
    address: "Björkgatan 12",
    city: "Skövde",
    accessNotes: "Ring innan, hund finns i huset.",
  },
  {
    id: "plats-2",
    customerId: "kund-2",
    address: "Ekvägen 4",
    city: "Skövde",
    accessNotes: "Nyckelbricka hämtas hos ordförande.",
  },
];

export const initialWorkOrders: WorkOrder[] = [
  {
    id: "ao-1001",
    customerId: "kund-1",
    siteId: "plats-1",
    assignedTo: "montor-1",
    title: "Felsökning köksuttag",
    description: "Jordfelsbrytaren löser ut när kaffebryggaren startas.",
    status: "assigned",
    priority: "normal",
    scheduledLabel: "Idag 09:00",
  },
  {
    id: "ao-1002",
    customerId: "kund-2",
    siteId: "plats-2",
    assignedTo: "montor-1",
    title: "Belysning i trapphus",
    description: "Två armaturer blinkar och behöver kontrolleras.",
    status: "on_the_way",
    priority: "high",
    scheduledLabel: "Idag 13:00",
  },
  {
    id: "ao-1003",
    customerId: "kund-2",
    siteId: "plats-2",
    title: "Planera elbilsladdare",
    description: "Förbered platsbesök och kontrollera centralens kapacitet.",
    status: "new",
    priority: "normal",
    scheduledLabel: "Ej bokad",
  },
];
