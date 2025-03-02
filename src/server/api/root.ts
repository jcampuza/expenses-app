import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { expensesRouter } from "~/server/api/routers/expenses";
import { invitationsRouter } from "~/server/api/routers/invitations";
import { connectionsRouter } from "~/server/api/routers/connections";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export const appRouter = createTRPCRouter({
  expense: expensesRouter,
  invitation: invitationsRouter,
  connections: connectionsRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

export const createCaller = createCallerFactory(appRouter);
