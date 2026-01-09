import { Suspense } from "react";
import BookingSuccessContent from "@/components/booking-success-content";

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <BookingSuccessContent />
    </Suspense>
  );
}
