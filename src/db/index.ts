import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __afgetiktSql: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL ontbreekt. Zie .env.example.");
}

// Hergebruik de connectie tussen hot-reloads in dev, anders lopen we vast op
// het max-connections limiet van Postgres/Supabase.
const sql =
  global.__afgetiktSql ??
  postgres(connectionString, { prepare: false, max: 10 });

if (process.env.NODE_ENV !== "production") {
  global.__afgetiktSql = sql;
}

export const db = drizzle(sql, { schema });
