import { Suspense } from "react";
import { AdminLoginClient } from "@/components/admin-login-client";

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginClient />
    </Suspense>
  );
}

