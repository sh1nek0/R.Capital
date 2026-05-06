import { AdminStartupCardClient } from "@/components/admin-startup-card-client";

export default function AdminStartupCardPage({
  params
}: {
  params: { id: string };
}) {
  return <AdminStartupCardClient id={params.id} />;
}
