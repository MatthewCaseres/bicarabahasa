import { db } from '~/server/db';


export async function createTestEnvironment(userId: string) {
  // Create all related data in one transaction
  const testData = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: `${userId}@test.com`,
        id: userId,
      }
    });

    const collection = await tx.collection.create({
      data: {
        name: 'Test Collection',
        createdById: user.id,
      }
    });

    const deck = await tx.deck.create({
      data: {
        name: 'Test Deck',
        collectionId: collection.id,
        createdById: user.id,
      }
    });

    const cards = [];
    const userCards = [];
    for (let i = 0; i < 10; i++) {
      const card = await tx.card.create({
        data: {
          indonesian: `Test Indonesian ${i}`,
          english: `Test English ${i}`,
          deckId: deck.id,
          createdById: user.id,
          indonesianAudioUrl: `https://example.com/audio/indonesian/${i}.mp3`,
          englishAudioUrl: `https://example.com/audio/english/${i}.mp3`,
        }
      });
      cards.push(card);
      const userCard = await tx.userCard.create({
        data: {
          userId: user.id,
          cardId: card.id,
        }
      });
      userCards.push(userCard);
    }

    return { user, collection, deck, cards, userCards };
  });

  return testData;
}

// Optional: Cleanup helper
export async function cleanupTestData(userId: string) {
  await db.$transaction(async (tx) => {
    await tx.userCard.deleteMany({ where: { userId } });
    await tx.card.deleteMany({ where: { createdById: userId } });
    await tx.deck.deleteMany({ where: { createdById: userId } });
    await tx.collection.deleteMany({ where: { createdById: userId } });
    await tx.user.delete({ where: { id: userId } });
  });
} 
