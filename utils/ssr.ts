import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { createContext } from "@/server/trpc";
import { appRouter } from "@/server/routers/_app";
import { cache } from "react";
import { QueryClient } from "@tanstack/react-query";


const createQueryClient = cache(() => new QueryClient());

async function createCallerContext() {
  return await createContext({
    headers: new Headers({ "x-user-id": "demo-user" }),
  });
}

export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  appRouter.createCaller(createCallerContext),
  createQueryClient
);