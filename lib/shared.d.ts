import { Sql } from "postgres";
import "dotenv/config";
export declare const initDb: () => Sql;
export declare const getMigrationDir: () => string;
