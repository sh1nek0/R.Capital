import { Suspense } from "react";
import { ConsultationRequestClient } from "@/components/consultation-request-client";

export default function ConsultationRequestPage() {
  return (
    <Suspense>
      <ConsultationRequestClient />
    </Suspense>
  );
}
