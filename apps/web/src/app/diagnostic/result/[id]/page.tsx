import { DiagnosticResultClient } from "@/components/diagnostic-result-client";

export default function DiagnosticResultPage({
  params
}: {
  params: { id: string };
}) {
  return <DiagnosticResultClient id={params.id} />;
}
