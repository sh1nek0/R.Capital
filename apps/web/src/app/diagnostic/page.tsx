import { Disclaimer } from "@/components/disclaimer";
import { DiagnosticWizard } from "@/components/diagnostic-wizard";

export default function DiagnosticPage() {
  return (
    <main className="min-h-screen bg-paper px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-steel">
          Диагностическая анкета
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">
          5-7 минут до первого маршрута финансирования
        </h1>

        <DiagnosticWizard />

        <div className="mt-6">
          <Disclaimer />
        </div>
      </div>
    </main>
  );
}
