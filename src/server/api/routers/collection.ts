import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const collectionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().nullable(),
        isPublic: z.boolean(),
        priority: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.collection.create({
        data: {
          name: input.name,
          description: input.description,
          isPublic: input.isPublic,
          priority: input.priority,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.collection.findMany({
      orderBy: [
        { isPublic: 'desc' },
        { priority: 'asc' }
      ],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.collection.findUnique({
        where: { id: input.id },
        include: { decks: true },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        description: z.string().nullable(),
        isPublic: z.boolean(),
        priority: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.collection.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          isPublic: input.isPublic,
          priority: input.priority,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.collection.delete({
        where: { id: input.id },
      });
    }),
});
