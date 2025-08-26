"use client";

import PaymentCallbackPage from "@/custom-pages/payment-callback";
import { Suspense } from "react";

export default function PaymentCallbackRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentCallbackPage />
    </Suspense>
  );
}
