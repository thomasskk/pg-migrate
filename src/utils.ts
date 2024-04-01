import { Sql } from "postgres";
import {
  MIGRATION_TABLE_NAME,
  MIGRATION_LOCK_ID1,
  MIGRATION_LOCK_ID2,
} from "./constants.js";
import { AppliedMigration, Migration } from "./types.js";
import crypto from "node:crypto";
import fs from "node:fs";

export const hasMigrationTable = async (sql: Sql): Promise<boolean> => {
  const rows = await sql<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT FROM 
					pg_tables	
        where 
        	tablename = ${MIGRATION_TABLE_NAME} 
			)`;

  return rows[0].exists;
};

export const ensureMigrationsTable = async (sql: Sql): Promise<void> => {
  await sql`
				CREATE TABLE IF NOT EXISTS ${sql(MIGRATION_TABLE_NAME)} (
					id TEXT PRIMARY KEY,
					checksum TEXT NOT NULL,
					execution_time_in_millis BIGINT NOT NULL,
					applied_at TIMESTAMPTZ NOT NULL
				)
			`;
};

export const applied = async (sql: Sql): Promise<AppliedMigration[]> => {
  const migrationTableExists = await hasMigrationTable(sql);

  if (!migrationTableExists) {
    return [];
  }

  const rows = await sql`
			SELECT id, checksum, execution_time_in_millis, applied_at
			FROM ${sql(MIGRATION_TABLE_NAME)} 
			`;

  return rows.map((row) => ({
    id: row.id,
    checksum: row.checksum,
    executionTimeInMillis: row.execution_time_in_millis,
    appliedAt: row.applied_at,
  }));
};

export const sortMigrations = (migrations: Migration[]): Migration[] => {
  return migrations.sort((a, b) => a.id.localeCompare(b.id));
};

export const getMD5 = (data: string) => {
  const md5sum = crypto.createHash("md5");
  return md5sum.update(data, "utf8").digest("hex");
};

export const acquireLock = async (sql: Sql): Promise<void> => {
  const lockAcquired = await sql<{ acquired: boolean }[]>`
		SELECT pg_try_advisory_lock(${MIGRATION_LOCK_ID1}, ${MIGRATION_LOCK_ID2}) as acquired
		`;

  if (!lockAcquired[0].acquired) {
    throw new Error("Could not acquire lock");
  }
};

export const releaseLock = async (sql: Sql): Promise<void> => {
  const lockReleased = await sql<{ released: boolean }[]>`
		SELECT pg_advisory_unlock(${MIGRATION_LOCK_ID1}, ${MIGRATION_LOCK_ID2}) as released
 `;

  if (!lockReleased[0].released) {
    throw new Error("Could not release lock");
  }
};

export const applyMigration = async (args: {
  sql: Sql;
  migration: Migration;
}): Promise<void> => {
  const { sql, migration } = args;

  const appliedAt = new Date();
  const startTime = performance.now();

  await sql.begin(async (sql) => {
    await sql.unsafe(migration.content);
    const endTime = performance.now();

    const executionTimeInMs = Math.trunc(endTime - startTime);
    const hash = getMD5(migration.content);

    await sql`
		INSERT INTO ${sql(MIGRATION_TABLE_NAME)} 
			(id, checksum, execution_time_in_millis, applied_at)
		VALUES 
			(${migration.id}, ${hash}, ${executionTimeInMs}, ${appliedAt} )
			`;
  });
};

export const getSortedMigrations = async (
  dir: string,
): Promise<Migration[]> => {
  const filenames = await fs.promises.readdir(dir);
  const filteredFilenames = filenames.filter((filename) =>
    filename.endsWith(".sql"),
  );

  const migrations = await Promise.all(
    filteredFilenames.map(async (filename) => {
      const content = await fs.promises.readFile(`${dir}/${filename}`, "utf-8");
      const id = filename.replace(".sql", "");
      return {
        id,
        content,
      };
    }),
  );

  return sortMigrations(migrations);
};
