import { Suspense } from "react";
import PaymentPage from "./PaymentPage"; 

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <PaymentPage />
    </Suspense>
  );
}
