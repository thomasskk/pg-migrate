import path from "node:path";
import { command } from "cmd-ts";
import { plan } from "../core.js";
import { initDb } from "../shared.js";

export const planCmd = command({
  name: "plan",
  args: {},
  handler: async () => {
    const migrationDir = path.join(process.cwd(), "migrations");

    const sql = initDb();

    const res = await plan({ sql, dir: migrationDir });

    for (const migration of res) {
      console.log(migration.id);
    }

    await sql.end({ timeout: 5 });
  },
});
