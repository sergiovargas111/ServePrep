"use client";

import { useState } from "react";
import ScenarioCard from "@/components/scenario-engine/scenario-card";
import type { Scenario, ScenarioChoice } from "@/types/scenario";

export default function ScenarioSession({
  scenarios,
}: {
  scenarios: Scenario[];
}) {
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  if (scenarios.length === 0) {
    return <p className="text-zinc-500">No scenarios available yet.</p>;
  }

  const isComplete = index >= scenarios.length;
  const currentScenario = scenarios[index];

  function handleAnswer(choice: ScenarioChoice) {
    setScore((prev) => ({
      correct: prev.correct + (choice.correct ? 1 : 0),
      total: prev.total + 1,
    }));
    setAnswered(true);
  }

  function handleNext() {
    setAnswered(false);
    setIndex((prev) => prev + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Score: {score.correct}/{score.total}
      </p>
      {isComplete ? (
        <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <p className="text-lg font-medium">
            You&apos;ve completed this set — {score.correct}/{score.total}{" "}
            correct
          </p>
        </div>
      ) : (
        <>
          <ScenarioCard
            key={currentScenario.id}
            scenario={currentScenario}
            onAnswer={handleAnswer}
          />
          {answered && (
            <button
              type="button"
              onClick={handleNext}
              className="self-start rounded-md bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Next
            </button>
          )}
        </>
      )}
    </div>
  );
}
