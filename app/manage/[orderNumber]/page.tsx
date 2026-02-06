import { Suspense } from "react";
import ManageBookingDetail from "@/components/manage-booking-detail";

export default function ManageBookingDetailPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <ManageBookingDetail orderNumber={params?.orderNumber || ""} mode="admin" />
    </Suspense>
  );
}
