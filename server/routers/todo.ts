import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { asc, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client";
import { todos } from "../db/schema";

export const todoRouter = router({
  // LEER todos (query) con paginación por cursor
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ input }) => {
      const { limit, cursor } = input;

     
      const rows = cursor
        ? await db
            .select()
            .from(todos)
            .where(gt(todos.id, cursor))
            .orderBy(asc(todos.id))
            .limit(limit + 1)
        : await db
            .select()
            .from(todos)
            .orderBy(asc(todos.id))
            .limit(limit + 1);

      const items = rows.slice(0, limit);
      return {
        items,
        nextCursor:
          rows.length > limit ? items[items.length - 1].id : null,
      };
    }),

  // CREAR un todo (mutation)
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().trim().min(1, "El título no puede estar vacío"),
      })
    )
    .mutation(async ({ input }) => {
      const [created] = await db
        .insert(todos)
        .values({ title: input.title })
        .returning();
      return created;
    }),

  // ACTUALIZAR un todo (título o completado)
  update: protectedProcedure
    .input(
      z
        .object({
          id: z.number().int().positive(),
          title: z.string().trim().min(1).optional(),
          completed: z.boolean().optional(),
        })
        .refine(
          (data) => data.title !== undefined || data.completed !== undefined,
          { message: "Debes enviar al menos title o completed" }
        )
    )
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(todos)
        .set({
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.completed !== undefined ? { completed: input.completed } : {}),
        })
        .where(eq(todos.id, input.id))
        .returning();
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Todo no encontrado" });
      }
      return updated;
    }),

  // BORRAR un todo (mutation)
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
      })
    )
    .mutation(async ({ input }) => {
      const [deleted] = await db
        .delete(todos)
        .where(eq(todos.id, input.id))
        .returning();
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Todo no encontrado" });
      }
      return deleted;
    }),
});