import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createTestEnvironment, cleanupTestData } from './helpers/testSetup';
import { db } from '~/server/db';
import type { PrismaClient, UserCard } from '@prisma/client';
import { reviewCardCalculations } from '~/server/api/utils/sm2';

type PC = PrismaClient;

const myUUID = randomUUID();

test('initial user card state', async () => {
  const { userCards } = await createTestEnvironment(myUUID);
  const userCard = userCards[0];
  if (!userCard) {
    throw new Error('User card not created');
  }
  expect(userCard.repetitions).toBe(0);
  expect(userCard.easeFactor).toBe(2.5);
  expect(userCard.interval).toBe(1);
  expect(userCard.nextReview).toBeDefined();
  expect(userCard.isAgain).toBe(false);
});

test('review card', async () => {
  const { userCards } = await createTestEnvironment(myUUID);
  const userCard = userCards[0];
  if (!userCard) {
    throw new Error('User card not created');
  }
  const cardId = userCard.id;
  const { newEaseFactor, newInterval, newRepetitions, newNextReview } = reviewCardCalculations(userCard, 2);
  const updatedUserCard = await db.userCard.update({
    where: { id: cardId },
    data: {
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      nextReview: newNextReview,
    },
  });
  expect(updatedUserCard.easeFactor).toBe(newEaseFactor);
  expect(updatedUserCard.interval).toBe(newInterval);
  expect(updatedUserCard.repetitions).toBe(newRepetitions);
  expect(updatedUserCard.nextReview.getTime()).toBeGreaterThan(Date.now());
});



test.afterEach(async () => {
  await cleanupTestData(myUUID);
});