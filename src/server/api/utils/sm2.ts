import type { UserCard } from '@prisma/client';

export function reviewCardCalculations(userCard: UserCard, quality: number) {
  const newEaseFactor = calculateEaseFactor(userCard, quality);
  const newInterval = calculateInterval(userCard, quality);
  const newRepetitions = calculateRepetitions(userCard, quality);
  const newNextReview = new Date(Date.now() + userCard.interval * 24 * 60 * 60 * 1000 - 1000 * 60 * 60 * 5);
  return { newEaseFactor, newInterval, newRepetitions, newNextReview };
}

export function calculateEaseFactor(userCard: UserCard, quality: number): number {
  const { easeFactor } = userCard;
  if (quality < 3) {
    return easeFactor;
  }
  return Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
}

export function calculateInterval(userCard: UserCard, quality: number): number {
  const { interval, easeFactor, repetitions } = userCard;
  if (quality < 3) {
    return 1;
  }
  if (repetitions === 1) {
    return 6;
  }
  return Math.ceil(interval * easeFactor);
}

export function calculateRepetitions(userCard: UserCard, quality: number): number {
  const { repetitions } = userCard;
  if (quality < 3) {
    return 0;
  }
  return repetitions + 1;
}