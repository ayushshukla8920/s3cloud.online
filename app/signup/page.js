import { Suspense } from "react";
import SignupPage from "./SignupPage"; 

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <SignupPage />
    </Suspense>
  );
}
