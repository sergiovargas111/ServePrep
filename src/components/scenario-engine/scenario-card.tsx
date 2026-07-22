"use client";

import { useState } from "react";
import type { Scenario } from "@/types/scenario";

export default function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedChoice =
    selectedIndex !== null ? scenario.choices[selectedIndex] : null;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
      <p className="text-lg">{scenario.prompt}</p>
      <div className="flex flex-col gap-2">
        {scenario.choices.map((choice, index) => {
          const isSelected = index === selectedIndex;
          const isCorrectChoice = choice.correct;

          let choiceClassName =
            "rounded-md border px-4 py-2 text-left transition-colors border-zinc-200 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600";

          if (selectedIndex !== null) {
            if (isSelected && isCorrectChoice) {
              choiceClassName =
                "rounded-md border px-4 py-2 text-left border-green-600 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-200";
            } else if (isSelected && !isCorrectChoice) {
              choiceClassName =
                "rounded-md border px-4 py-2 text-left border-red-600 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200";
            } else {
              choiceClassName =
                "rounded-md border px-4 py-2 text-left border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-500";
            }
          }

          return (
            <button
              key={`${scenario.id}-${index}`}
              type="button"
              disabled={selectedIndex !== null}
              onClick={() => setSelectedIndex(index)}
              className={choiceClassName}
            >
              {choice.text}
            </button>
          );
        })}
      </div>
      {selectedChoice && (
        <p
          className={
            selectedChoice.correct
              ? "font-medium text-green-700 dark:text-green-400"
              : "font-medium text-red-700 dark:text-red-400"
          }
        >
          {selectedChoice.correct ? "Correct — " : "Incorrect — "}
          {selectedChoice.feedback}
        </p>
      )}
    </div>
  );
}
