import { auth } from "@/auth";
import ScenarioSession from "@/components/scenario-engine/scenario-session";
import { getScenariosByType } from "@/lib/scenarios";

export default async function CustomerSimulatorPage() {
  const session = await auth().catch(() => null);
  const scenarios = getScenariosByType("menu_question");

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Customer Simulator
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          A guest asks a menu question — pick the correct answer.
        </p>
      </div>
      <ScenarioSession scenarios={scenarios} isSignedIn={!!session?.user} />
    </main>
  );
}
