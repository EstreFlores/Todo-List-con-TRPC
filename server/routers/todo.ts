import { router, publicProcedure } from "../trpc";
import { z } from "zod";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

const todos: Todo[] = [
  {
    id: 1,
    title: "Aprender tRPC, este es un ejemplo",
    completed: false,
  },
  {
    id: 2,
    title: "Crear mi Todo List",
    completed: false,
  },
];

// Contador para asignar ids únicos
let nextId = 3;

export const todoRouter = router({
  // LEER todos (query)
  list: publicProcedure.query(() => {
    return todos;
  }),

  // CREAR un todo (mutation)
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "El título no puede estar vacío"),
      })
    )
    .mutation(({ input }) => {
      const newTodo: Todo = {
        id: nextId++,
        title: input.title,
        completed: false,
      };
      todos.push(newTodo);
      return newTodo;
    }),

  // ACTUALIZAR un todo (título )
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        completed: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => {
      const todo = todos.find((t) => t.id === input.id);
      if (!todo) {
        throw new Error("Todo no encontrado");
      }
      if (input.title !== undefined) todo.title = input.title;
      if (input.completed !== undefined) todo.completed = input.completed;
      return todo;
    }),

  // BORRAR un todo (mutation)
  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(({ input }) => {
      const index = todos.findIndex((t) => t.id === input.id);
      if (index === -1) {
        throw new Error("Todo no encontrado");
      }
      const [removed] = todos.splice(index, 1);
      return removed;
    }),
});
