import {
  type WorkOrderPriority,
  type WorkOrderStatus,
  priorityLabels,
  workOrderStatusLabels,
} from "@/lib/domain";

const statusClasses: Record<WorkOrderStatus, string> = {
  new: "border-slate-300 bg-slate-50 text-slate-700",
  scheduled: "border-sky-200 bg-sky-50 text-sky-800",
  assigned: "border-teal-200 bg-teal-50 text-teal-800",
  on_the_way: "border-cyan-200 bg-cyan-50 text-cyan-800",
  in_progress: "border-amber-200 bg-amber-50 text-amber-800",
  waiting_for_material: "border-orange-200 bg-orange-50 text-orange-800",
  waiting_for_customer: "border-yellow-200 bg-yellow-50 text-yellow-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  ready_for_invoice: "border-violet-200 bg-violet-50 text-violet-800",
  invoiced: "border-green-200 bg-green-50 text-green-800",
  cancelled: "border-red-200 bg-red-50 text-red-800",
};

const priorityClasses: Record<WorkOrderPriority, string> = {
  low: "border-slate-300 bg-white text-slate-600",
  normal: "border-teal-200 bg-white text-teal-800",
  high: "border-amber-200 bg-white text-amber-800",
  urgent: "border-red-200 bg-white text-red-800",
};

export function StatusBadge({ status }: { status: WorkOrderStatus }) {
  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full border px-3 text-sm font-medium ${statusClasses[status]}`}
    >
      {workOrderStatusLabels[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: WorkOrderPriority }) {
  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full border px-3 text-sm font-medium ${priorityClasses[priority]}`}
    >
      {priorityLabels[priority]}
    </span>
  );
}
