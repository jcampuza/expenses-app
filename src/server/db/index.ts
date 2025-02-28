import * as schema from "./schema";
import { env } from "~/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const p = postgres(env.POSTGRES_URL, {
  ssl: env.NODE_ENV === "production" ? "require" : false,
});

export const db = drizzle(p, { schema });

export type DB = typeof db;
