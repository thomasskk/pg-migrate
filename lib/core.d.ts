import { Sql } from "postgres";
import { Migration } from "./types.js";
export declare const reset: (args: {
    sql: Sql;
}) => Promise<void>;
export declare const plan: (args: {
    sql: Sql;
    dir: string;
}) => Promise<Migration[]>;
export declare const verify: (args: {
    sql: Sql;
    dir: string;
}) => Promise<void>;
export declare const migrate: (args: {
    sql: Sql;
    dir: string;
}) => Promise<void>;
