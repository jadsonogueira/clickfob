import { Suspense } from "react";
import BookingFlow from "@/components/booking-flow";

export default function BookPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
          <BookingFlow />
        </Suspense>
      </div>
    </div>
  );
}
