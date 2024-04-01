import { command } from "cmd-ts";
import { reset } from "../core.js";
import { initDb } from "../shared.js";

export const resetCmd = command({
  name: "reset",
  args: {},
  handler: async () => {
    const sql = initDb();

    await reset({ sql });

    await sql.end({ timeout: 5 });
  },
});
