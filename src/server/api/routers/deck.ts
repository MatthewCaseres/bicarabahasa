import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const deckRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), collectionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.deck.create({
        data: {
          name: input.name,
          collection: { connect: { id: input.collectionId } },
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

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
      return ctx.db.deck.findMany({ where: { collectionId: input.collectionId } });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.deck.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.deck.delete({
        where: { id: input.id },
      });
    }),
});
