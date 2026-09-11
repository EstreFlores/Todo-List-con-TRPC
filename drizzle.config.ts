import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./server/db/schema.ts",
  dbCredentials: {
    url: "./todo.db",
  },
});