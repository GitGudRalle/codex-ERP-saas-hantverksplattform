export const workOrderStatuses = [
  "new",
  "scheduled",
  "assigned",
  "on_the_way",
  "in_progress",
  "waiting_for_material",
  "waiting_for_customer",
  "completed",
  "ready_for_invoice",
  "invoiced",
  "cancelled",
] as const;

export type WorkOrderStatus = (typeof workOrderStatuses)[number];

export const workOrderStatusLabels: Record<WorkOrderStatus, string> = {
  new: "Ny",
  scheduled: "Bokad",
  assigned: "Tilldelad",
  on_the_way: "På väg",
  in_progress: "Pågående",
  waiting_for_material: "Väntar material",
  waiting_for_customer: "Väntar kund",
  completed: "Klar",
  ready_for_invoice: "Klar för fakturering",
  invoiced: "Fakturerad",
  cancelled: "Avbruten",
};

export const priorityLabels = {
  low: "Låg",
  normal: "Normal",
  high: "Hög",
  urgent: "Akut",
} as const;

export type WorkOrderPriority = keyof typeof priorityLabels;

export type Electrician = {
  id: string;
  name: string;
  phone: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: "private" | "business" | "brf" | "property_owner";
};

export type Site = {
  id: string;
  customerId: string;
  address: string;
  city: string;
  accessNotes?: string;
};

export type WorkOrder = {
  id: string;
  customerId: string;
  siteId: string;
  assignedTo?: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  scheduledLabel: string;
};

export const nextFieldStatuses: WorkOrderStatus[] = [
  "assigned",
  "on_the_way",
  "in_progress",
  "waiting_for_material",
  "waiting_for_customer",
  "completed",
];
