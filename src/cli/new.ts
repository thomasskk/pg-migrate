import { command, string, option } from "cmd-ts";
import fs from "node:fs";
import path from "node:path";
import { getMigrationDir } from "../shared.js";

export const newCmd = command({
  name: "new",
  args: {
    name: option({
      type: string,
      long: "name",
      short: "n",
      defaultValue: () => "",
    }),
    dir: option({
      type: string,
      long: "dir",
      short: "d",
      defaultValue: () => {
        return getMigrationDir();
      },
    }),
  },
  handler: async ({ name, dir }) => {
    console.log("Creating migration...");
    await fs.promises.writeFile(
      path.join(dir, `${Date.now()}${name ? `-${name}` : ""}.sql`),
      `-- ${name}\n`,
    );
  },
});
