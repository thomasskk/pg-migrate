import { command } from "cmd-ts";
import { migrate } from "../core.js";
import { getMigrationDir, initDb } from "../shared.js";

export const migrateCmd = command({
  name: "migrate",
  args: {},
  handler: async () => {
    const migrationDir = getMigrationDir();

    const sql = initDb();

    await migrate({ sql, dir: migrationDir });

    await sql.end({ timeout: 5 });
  },
});
