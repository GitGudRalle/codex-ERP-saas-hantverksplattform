import { WorkOrderDetail } from "@/components/work-order-detail";

type WorkOrderDetailPageProps = {
  params: {
    id: string;
  };
};

export default function WorkOrderDetailPage({
  params,
}: WorkOrderDetailPageProps) {
  return <WorkOrderDetail workOrderId={params.id} />;
}
