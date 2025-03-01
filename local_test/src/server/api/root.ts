import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { greetRouter } from "./routers/greet";
import { analyseRouter } from "./routers/analyseRouter";
import { iterationDataRouter } from "./routers/iterationData";
import { fileRouter } from "./routers/fileRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  greet: greetRouter,
  analyse: analyseRouter,
  iterationdata: iterationDataRouter,
  file: fileRouter
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
