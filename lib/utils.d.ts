import { Sql } from "postgres";
import { AppliedMigration, Migration } from "./types.js";
export declare const hasMigrationTable: (sql: Sql) => Promise<boolean>;
export declare const ensureMigrationsTable: (sql: Sql) => Promise<void>;
export declare const applied: (sql: Sql) => Promise<AppliedMigration[]>;
export declare const sortMigrations: (migrations: Migration[]) => Migration[];
export declare const getMD5: (data: string) => string;
export declare const acquireLock: (sql: Sql) => Promise<void>;
export declare const releaseLock: (sql: Sql) => Promise<void>;
export declare const applyMigration: (args: {
    sql: Sql;
    migration: Migration;
}) => Promise<void>;
export declare const getSortedMigrations: (dir: string) => Promise<Migration[]>;
