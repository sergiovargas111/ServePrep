export type ReviewRating = "again" | "hard" | "good" | "easy";

export interface CardSchedule {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  dueDate: string;
}

// Maps the 4-button UI rating onto the 0-5 quality scale SM-2 expects.
// "again" fails the review (quality < 3); the other three all pass but
// shape the ease factor differently.
const RATING_QUALITY: Record<ReviewRating, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

export function createInitialSchedule(now: Date = new Date()): CardSchedule {
  return {
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    dueDate: now.toISOString(),
  };
}

export function reviewCard(
  schedule: CardSchedule,
  rating: ReviewRating,
  now: Date = new Date(),
): CardSchedule {
  const quality = RATING_QUALITY[rating];

  let { easeFactor, intervalDays, repetitions } = schedule;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + intervalDays);

  return {
    easeFactor,
    intervalDays,
    repetitions,
    dueDate: dueDate.toISOString(),
  };
}

export function isDue(schedule: CardSchedule, now: Date = new Date()): boolean {
  return new Date(schedule.dueDate).getTime() <= now.getTime();
}
