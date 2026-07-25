"use server";

import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const recordFlashcardReviewSchema = z.object({
  cardId: z.string().min(1),
  easeFactor: z.number(),
  intervalDays: z.number(),
  repetitions: z.number(),
  dueDate: z.string(),
});

export async function recordFlashcardReview(
  input: z.infer<typeof recordFlashcardReviewSchema>,
) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) return;

  const parsed = recordFlashcardReviewSchema.safeParse(input);
  if (!parsed.success) return;

  const { cardId, easeFactor, intervalDays, repetitions, dueDate } =
    parsed.data;
  const userId = session.user.id;

  await prisma.flashcardReview.upsert({
    where: { userId_cardId: { userId, cardId } },
    create: {
      userId,
      cardId,
      easeFactor,
      intervalDays,
      repetitions,
      dueDate: new Date(dueDate),
    },
    update: {
      easeFactor,
      intervalDays,
      repetitions,
      dueDate: new Date(dueDate),
    },
  });
}
