import { Suspense } from "react";
import LoginPage from "./LoginPage"; 

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
