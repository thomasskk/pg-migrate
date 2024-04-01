import postgres, { Sql } from "postgres";
import path from "node:path";
import * as t from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import "dotenv/config";

const envSchema = t.Object({
  POSTGRES_DB: t.String(),
  POSTGRES_HOST: t.String(),
  POSTGRES_PORT: t.String(),
  POSTGRES_USER: t.String(),
  POSTGRES_PASSWORD: t.String(),
});

const env = TypeCompiler.Compile(envSchema).Decode(process.env);

export const initDb = (): Sql => {
  const sql = postgres({
    db: env.POSTGRES_DB,
    username: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    host: env.POSTGRES_HOST,
    port: +env.POSTGRES_PORT,
  });

  return sql;
};

export const getMigrationDir = (): string => {
  return path.join(process.cwd(), "migrations");
};
