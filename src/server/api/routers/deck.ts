import { z } from "zod";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";

async function rebalancePriorities(db: PrismaClient, collectionId: string) {
  const decks = await db.deck.findMany({
    where: { collectionId },
    orderBy: [
      { isPublic: 'desc' },
      { priority: 'asc' }
    ],
  });

  const updates = decks.map((deck, index) => 
    db.deck.update({
      where: { id: deck.id },
      data: { priority: (index + 1) * 10 }
    })
  );

  await db.$transaction(updates);
}

export const deckRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.deck.findMany({
      include: { cards: true },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.deck.findUnique({
        where: { id: input.id },
        include: { cards: true },
      });
    }),

  getByCollectionId: protectedProcedure
    .input(z.object({ collectionId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.deck.findMany({
        where: { collectionId: input.collectionId },
      });
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().nullable(),
        isPublic: z.boolean(),
        priority: z.number().int(),
        collectionId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deck = await ctx.db.deck.create({
        data: {
          name: input.name,
          description: input.description,
          isPublic: input.isPublic,
          priority: input.priority,
          collection: { connect: { id: input.collectionId } },
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });

      await rebalancePriorities(ctx.db, input.collectionId);
      return deck;
    }),


  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        isPublic: z.boolean(),
        description: z.string().nullable(),
        priority: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deck = await ctx.db.deck.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          isPublic: input.isPublic,
          priority: input.priority,
        },
      });

      await rebalancePriorities(ctx.db, deck.collectionId);
      return deck;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.deck.delete({
        where: { id: input.id },
      });
    }),
});
