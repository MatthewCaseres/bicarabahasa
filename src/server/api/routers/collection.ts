import { z } from "zod";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { PrismaClient, Card } from "@prisma/client";

async function rebalancePriorities(db: PrismaClient) {
  const collections = await db.collection.findMany({
    orderBy: [
      { isPublic: 'desc' },
      { priority: 'asc' }
    ],
  });

  const updates = collections.map((collection, index) => {
    return db.collection.update({
      where: { id: collection.id },
      data: { priority: (index + 1) * 10 },
    });
  });

  await db.$transaction(updates);
}

export const collectionRouter = createTRPCRouter({

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
      const collection = await ctx.db.collection.findUnique({
        where: { id: input.id },
        include: { 
          decks: { 
            orderBy: [{ isPublic: "desc" }, { priority: "asc" }],
            include: {
              _count: {
                select: {
                  cards: {
                    where: {
                      userCards: {
                        none: {
                          userId: ctx.session.user.id
                        }
                      }
                    }
                  }
                }
              }
            }
          } 
        },
      });
      console.dir(collection, { depth: null });
      return collection;
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().nullable(),
        isPublic: z.boolean(),
        priority: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const collection = await ctx.db.collection.create({
        data: {
          name: input.name,
          description: input.description,
          isPublic: input.isPublic,
          priority: input.priority,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });

      await rebalancePriorities(ctx.db);
      return collection;
    }),

  update: adminProcedure
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
      const collection = await ctx.db.collection.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          isPublic: input.isPublic,
          priority: input.priority,
        },
      });

      await rebalancePriorities(ctx.db);
      return collection;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.collection.delete({
        where: { id: input.id },
      });
    }),
});
