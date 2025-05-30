import postgres, { Sql } from "postgres";
import path from "node:path";
import z from "zod/v4";
import "dotenv/config";

const envSchema = z.object({
	POSTGRES_DB: z.string(),
	POSTGRES_HOST: z.string(),
	POSTGRES_PORT: z.string(),
	POSTGRES_USER: z.string(),
	POSTGRES_PASSWORD: z.string(),
});

const env = envSchema.parse(process.env);

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
