import ScenarioSession from "@/components/scenario-engine/scenario-session";
import { getScenariosByType } from "@/lib/scenarios";

export default function DifficultCustomerPage() {
  const scenarios = getScenariosByType("difficult_customer");

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Difficult Customer Scenarios
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Practice de-escalating a tense guest interaction — pick the best
          response.
        </p>
      </div>
      <ScenarioSession scenarios={scenarios} />
    </main>
  );
}
