import { Suspense } from "react";
import { FounderLoginClient } from "@/components/founder-login-client";

export default function LoginPage() {
  return (
    <Suspense>
      <FounderLoginClient />
    </Suspense>
  );
}

