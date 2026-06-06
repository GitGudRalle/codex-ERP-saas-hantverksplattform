import { CustomerDetail } from "@/components/customer-detail";

type CustomerDetailPageProps = {
  params: {
    id: string;
  };
};

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  return <CustomerDetail customerId={params.id} />;
}
