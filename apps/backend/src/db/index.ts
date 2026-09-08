import 'dotenv/config';
import {drizzle} from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.ts";

const port = process.env.PORT_DB || "5432";
const url = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${port}/${process.env.DB_NAME}`;

export const client = postgres(url);
export const db = drizzle(client, {schema});
