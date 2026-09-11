import { TRPCError, initTRPC } from "@trpc/server";


type CreateContextOptions = {
  headers: Headers;
};

export const createContext = ({ headers }: CreateContextOptions) => {

  const user = headers.get("x-user-id") ?? null;
  return { user, headers };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// --- Middleware --

const t = initTRPC.context<Context>().create();

// timing: mide y loguea cuanto tarda CADA request.
const timing = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const ms = Date.now() - start;
  if (result.ok) {
    console.log(`[timing] ${type} ${path} ${ms}ms`);
  }
  return result;
});

// protected: rechaza el request si no hay usuario autenticado.
// Al pasar el usuario ya verificado en ctx, los procedures lo ven tipado.
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No autenticado: falta el header x-user-id",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const router = t.router;

// Todos los procedures miden su tiempo automaticamente.
export const publicProcedure = t.procedure.use(timing);
export const protectedProcedure = t.procedure.use(timing).use(isAuthed);