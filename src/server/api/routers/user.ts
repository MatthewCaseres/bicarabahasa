import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { Role } from "@prisma/client";

export const userRouter = createTRPCRouter({
  makeAdmin: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if the current user is an admin
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (currentUser?.role !== Role.ADMIN) {
        throw new Error("Only admins can make other users admins");
      }

      // Update the user's role to ADMIN
      return ctx.db.user.update({
        where: { id: input.userId },
        data: { role: Role.ADMIN },
      });
    }),

  getCurrentUser: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });
    }),

  getAllUsers: protectedProcedure
    .query(async ({ ctx }) => {
      // Check if the current user is an admin
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (currentUser?.role !== Role.ADMIN) {
        throw new Error("Only admins can view all users");
      }

      return ctx.db.user.findMany();
    }),
});
