import { subcommands, run } from "cmd-ts";
import { migrateCmd } from "./migrate.js";
import { planCmd } from "./plan.js";
import { resetCmd } from "./reset.js";
import { verifyCmd } from "./verify.js";
import { newCmd } from "./new.js";

const subcmd = subcommands({
  name: "pg-migrate",
  cmds: {
    verify: verifyCmd,
    plan: planCmd,
    migrate: migrateCmd,
    reset: resetCmd,
    new: newCmd,
  },
});

run(subcmd, process.argv.slice(2));
