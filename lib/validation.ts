import { z } from "zod";

export const customerRequestSchema = z.object({
  customerName: z.string().min(2, "Ange kundens namn"),
  phone: z.string().min(5, "Ange telefonnummer"),
  address: z.string().min(3, "Ange adress"),
  city: z.string().min(2, "Ange ort"),
  title: z.string().min(3, "Ange rubrik"),
  description: z.string().min(8, "Beskriv jobbet kort"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
});

export type CustomerRequestForm = z.infer<typeof customerRequestSchema>;
