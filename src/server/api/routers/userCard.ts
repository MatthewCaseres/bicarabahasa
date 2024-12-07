import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { reviewCardCalculations } from "~/server/api/utils/sm2";

export const userCardRouter = createTRPCRouter({

  getAllReviewable: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.userCard.findMany({
        where: { userId: input.userId },
        orderBy: { nextReview: 'asc' },
      });
    }),
  addDeckToUser: protectedProcedure
    .input(z.object({ userId: z.string(), deckId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get all cards from the deck
      const cards = await ctx.db.card.findMany({
        where: { deckId: input.deckId },
      });

      // Get existing userCards for this user and deck
      const existingUserCards = await ctx.db.userCard.findMany({
        where: {
          userId: input.userId,
          cardId: { in: cards.map(card => card.id) }
        },
      });

      // Filter out cards that user already has
      const existingCardIds = new Set(existingUserCards.map(uc => uc.cardId));
      const newCards = cards.filter(card => !existingCardIds.has(card.id));

      // Only create records for new cards
      return ctx.db.userCard.createMany({
        data: newCards.map(card => ({
          cardId: card.id,
          userId: input.userId,
        })),
        skipDuplicates: true, // Extra safety measure
      });
    }),
  reviewCard: protectedProcedure
    .input(z.object({ cardId: z.string(), quality: z.number() }))
    .mutation(async ({ ctx, input }) => {
      let userCard = await ctx.db.userCard.findFirst({
        where: { 
          cardId: input.cardId,
          userId: ctx.session.user.id
        },
      });
      if (userCard === null) {
        userCard = await ctx.db.userCard.create({
          data: {
            cardId: input.cardId,
            userId: ctx.session.user.id,
          },
        });
      }
      const { newInterval, newRepetitions, newEaseFactor, newNextReview } = reviewCardCalculations(userCard, input.quality);
      return ctx.db.userCard.update({
        where: { id: userCard.id },
        data: {
          interval: newInterval,
          repetitions: newRepetitions,
          easeFactor: newEaseFactor,
          nextReview: newNextReview,
        }
      });
    }),

  update: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      english: z.string().min(1),
      indonesian: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.card.update({
        where: { id: input.id },
        data: { 
          english: input.english,
          indonesian: input.indonesian,
        },
      });
    }),
});
