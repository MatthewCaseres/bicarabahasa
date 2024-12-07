import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { openaiRouter } from "~/server/api/routers/openai";
import { collectionRouter } from "~/server/api/routers/collection";
import { deckRouter } from "~/server/api/routers/deck";
import { cardRouter } from "~/server/api/routers/card";
import { userCardRouter } from "~/server/api/routers/userCard";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  openai: openaiRouter,
  collection: collectionRouter,
  deck: deckRouter,
  card: cardRouter,
  userCard: userCardRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
