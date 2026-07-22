export type ScenarioType = "menu_question" | "difficult_customer";

export interface ScenarioChoice {
  text: string;
  correct: boolean;
  feedback: string;
}

export interface Scenario {
  id: string;
  type: ScenarioType;
  prompt: string;
  choices: ScenarioChoice[];
  tags: string[];
}
