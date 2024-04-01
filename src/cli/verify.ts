import path from "node:path";
import { command } from "cmd-ts";
import { verify } from "../core.js";
import { initDb } from "../shared.js";

export const verifyCmd = command({
  name: "verify",
  args: {},
  handler: async () => {
    const migrationDir = path.join(process.cwd(), "migrations");

    const sql = initDb();

    await verify({ sql, dir: migrationDir });

    await sql.end({ timeout: 5 });
  },
});
