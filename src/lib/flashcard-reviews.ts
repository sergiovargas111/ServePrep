import prisma from "@/lib/prisma";
import type { CardSchedule } from "@/lib/spaced-repetition";

export async function getFlashcardSchedules(
  userId: string,
): Promise<Record<string, CardSchedule>> {
  const reviews = await prisma.flashcardReview.findMany({
    where: { userId },
  });

  const schedules: Record<string, CardSchedule> = {};
  for (const review of reviews) {
    schedules[review.cardId] = {
      easeFactor: review.easeFactor,
      intervalDays: review.intervalDays,
      repetitions: review.repetitions,
      dueDate: review.dueDate.toISOString(),
    };
  }
  return schedules;
}
