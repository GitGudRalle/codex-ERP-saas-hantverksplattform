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

export const timeEntrySchema = z.object({
  hours: z.coerce
    .number({
      invalid_type_error: "Ange antal timmar",
    })
    .positive("Timmar måste vara större än 0")
    .max(24, "Rapportera högst 24 timmar åt gången"),
  description: z.string().max(200, "Beskrivningen är för lång").optional(),
});

export const materialEntrySchema = z.object({
  name: z.string().min(2, "Ange material").max(80, "Materialnamnet är för långt"),
  quantity: z.coerce
    .number({
      invalid_type_error: "Ange antal",
    })
    .positive("Antal måste vara större än 0"),
  unit: z.string().min(1, "Ange enhet").max(12, "Enheten är för lång"),
});

export type TimeEntryForm = z.infer<typeof timeEntrySchema>;
export type MaterialEntryForm = z.infer<typeof materialEntrySchema>;
