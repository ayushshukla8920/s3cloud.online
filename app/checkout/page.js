import { Suspense } from "react";
import CheckoutPage from "./CheckoutPage"; 

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <CheckoutPage />
    </Suspense>
  );
}
