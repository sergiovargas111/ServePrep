import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getScenarioType } from "@/lib/scenarios";

function formatPercent(correct: number, attempted: number): string {
  if (attempted === 0) return "—";
  return `${Math.round((correct / attempted) * 100)}%`;
}

function isPastDue(dueDate: Date, now: Date = new Date()): boolean {
  return dueDate.getTime() <= now.getTime();
}

export default async function DashboardPage() {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Sign in to track your progress across quizzes and scenarios.
          </p>
        </div>
        <Link
          href="/sign-in"
          className="self-start rounded-md bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const userId = session.user.id;

  const [scenarioResults, flashcardReviews] = await Promise.all([
    prisma.scenarioResult.findMany({ where: { userId } }),
    prisma.flashcardReview.findMany({ where: { userId } }),
  ]);

  const totalAttempted = scenarioResults.length;
  const totalCorrect = scenarioResults.filter((r) => r.correct).length;
  const overallAccuracy =
    totalAttempted > 0 ? totalCorrect / totalAttempted : 0;

  const menuQuestionResults = scenarioResults.filter(
    (r) => getScenarioType(r.scenarioId) === "menu_question",
  );
  const difficultCustomerResults = scenarioResults.filter(
    (r) => getScenarioType(r.scenarioId) === "difficult_customer",
  );

  const breakdown = [
    {
      label: "Menu Question",
      attempted: menuQuestionResults.length,
      correct: menuQuestionResults.filter((r) => r.correct).length,
    },
    {
      label: "Difficult Customer",
      attempted: difficultCustomerResults.length,
      correct: difficultCustomerResults.filter((r) => r.correct).length,
    },
  ];

  const dueCount = flashcardReviews.filter((r) => isPastDue(r.dueDate)).length;
  const laterCount = flashcardReviews.length - dueCount;

  const categoriesAttempted = [
    menuQuestionResults.length > 0,
    difficultCustomerResults.length > 0,
    flashcardReviews.length > 0,
  ].filter(Boolean).length;

  const isReady = categoriesAttempted === 3 && overallAccuracy >= 0.75;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Your progress across menu quizzes and scenario practice.
        </p>
      </div>

      {isReady ? (
        <div className="rounded-lg border border-green-600 bg-green-50 p-6 dark:bg-green-950">
          <p className="text-lg font-semibold text-green-900 dark:text-green-200">
            Ready!
          </p>
          <p className="text-sm text-green-800 dark:text-green-300">
            You&apos;ve attempted every category with{" "}
            {Math.round(overallAccuracy * 100)}% overall accuracy.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <p className="text-lg font-medium">
            {categoriesAttempted} of 3 categories attempted,{" "}
            {Math.round(overallAccuracy * 100)}% accuracy — keep going
          </p>
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Scenario Accuracy
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Overall: {totalCorrect}/{totalAttempted} (
          {formatPercent(totalCorrect, totalAttempted)})
        </p>
        <ul className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          {breakdown.map(({ label, attempted, correct }) => (
            <li key={label} className="flex justify-between gap-4">
              <span>{label}</span>
              <span>
                {attempted > 0
                  ? `${correct}/${attempted} (${formatPercent(correct, attempted)})`
                  : "Not attempted yet"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Flashcard Progress
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          {flashcardReviews.length > 0
            ? `${dueCount} due · ${laterCount} scheduled for later`
            : "No flashcards reviewed yet."}
        </p>
      </section>
    </main>
  );
}
