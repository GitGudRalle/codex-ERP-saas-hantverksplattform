import type { WorkOrderPriority, WorkOrderStatus } from "@/lib/domain";

export type ProfileRow = {
  id: string;
  company_id: string;
  role: "admin" | "manager" | "electrician";
  full_name: string;
  phone: string | null;
};

export type CustomerRow = {
  id: string;
  company_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  customer_type: string;
  created_at: string;
};

export type SiteRow = {
  id: string;
  company_id: string;
  customer_id: string;
  name: string | null;
  address: string;
  city: string | null;
  access_notes: string | null;
};

export type WorkOrderRow = {
  id: string;
  company_id: string;
  customer_id: string;
  site_id: string;
  assigned_to: string | null;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  scheduled_start: string | null;
  completed_at: string | null;
  created_at: string;
};

export type WorkOrderNoteRow = {
  id: string;
  company_id: string;
  work_order_id: string;
  author_id: string;
  note: string;
  created_at: string;
};

export type WorkOrderPhotoRow = {
  id: string;
  company_id: string;
  work_order_id: string;
  uploaded_by: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
};

export type TimeEntryRow = {
  id: string;
  company_id: string;
  work_order_id: string;
  electrician_id: string;
  entry_date: string;
  hours: number;
  description: string | null;
  created_at: string;
};

export type MaterialEntryRow = {
  id: string;
  company_id: string;
  work_order_id: string;
  added_by: string;
  name: string;
  quantity: number;
  unit: string;
  created_at: string;
};

export type InvoiceDraftRow = {
  id: string;
  company_id: string;
  work_order_id: string;
  status: "draft" | "ready" | "exported";
  invoice_text: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
