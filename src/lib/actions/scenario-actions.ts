"use server";

import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const recordScenarioResultSchema = z.object({
  scenarioId: z.string().min(1),
  correct: z.boolean(),
});

export async function recordScenarioResult(
  input: z.infer<typeof recordScenarioResultSchema>,
) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) return;

  const parsed = recordScenarioResultSchema.safeParse(input);
  if (!parsed.success) return;

  await prisma.scenarioResult.create({
    data: {
      userId: session.user.id,
      scenarioId: parsed.data.scenarioId,
      correct: parsed.data.correct,
    },
  });
}
