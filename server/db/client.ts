import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

export const db = drizzle(
  createClient({
    url: "file:todo.db",
  })
);