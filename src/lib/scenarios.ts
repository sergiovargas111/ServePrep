import scenariosData from "@/data/scenarios.json";
import type { Scenario, ScenarioType } from "@/types/scenario";

const scenarios = scenariosData as Scenario[];

export function getScenariosByType(type: ScenarioType): Scenario[] {
  return scenarios.filter((scenario) => scenario.type === type);
}

const scenarioTypeById = new Map(
  scenarios.map((scenario) => [scenario.id, scenario.type]),
);

export function getScenarioType(scenarioId: string): ScenarioType | undefined {
  return scenarioTypeById.get(scenarioId);
}
