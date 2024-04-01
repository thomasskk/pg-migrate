import { Sql } from "postgres";
import { MIGRATION_TABLE_NAME } from "./constants.js";
import { Migration } from "./types.js";
import {
  applied,
  acquireLock,
  ensureMigrationsTable,
  applyMigration,
  releaseLock,
  getMD5,
  getSortedMigrations,
} from "./utils.js";

export const reset = async (args: { sql: Sql }) => {
  const { sql } = args;

  await sql`
		DROP TABLE IF EXISTS ${sql(MIGRATION_TABLE_NAME)}
	`;
};

export const plan = async (args: {
  sql: Sql;
  dir: string;
}): Promise<Migration[]> => {
  const { sql, dir } = args;

  const appliedMigrations = await applied(sql);
  const migrations = await getSortedMigrations(dir);

  return migrations.filter((migration) => {
    return !appliedMigrations.some((applied) => applied.id === migration.id);
  });
};

export const verify = async (args: {
  sql: Sql;
  dir: string;
}): Promise<void> => {
  const { sql, dir } = args;

  const appliedMigrations = await applied(sql);
  const migrations = await getSortedMigrations(dir);

  const errors: string[] = [];

  for (const appliedMigration of appliedMigrations) {
    const migration = migrations.find(
      (migration) => migration.id === appliedMigration.id,
    );

    if (!migration) {
      errors.push(`Migration ${appliedMigration.id} not found`);
      continue;
    }

    const hash = getMD5(migration.content);

    if (appliedMigration.checksum !== hash) {
      errors.push(
        `Migration ${migration.id} checksum mismatch. Expected ${hash}, got ${appliedMigration.checksum}`,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
};

export const migrate = async (args: {
  sql: Sql;
  dir: string;
}): Promise<void> => {
  const { sql, dir } = args;

  console.log("Acquiring lock...");
  await acquireLock(sql);

  console.log("Ensuring migrations table...");
  await ensureMigrationsTable(sql);

  console.log("Planning migrations...");
  const plannedMigrations = await plan({ sql, dir });
  console.log(plannedMigrations);

  console.log("Applying migrations...");
  for (const migration of plannedMigrations) {
    console.log(`Applying migration ${migration.id}...`);
    await applyMigration({ sql, migration });
  }

  console.log("Verifying...");
  await verify({ sql, dir });

  console.log("Releasing lock...");
  await releaseLock(sql);
};
