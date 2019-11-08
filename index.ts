#!/usr/bin/env node

const yargs = require("yargs");
import path from "path";

import { argvChecks, androidArgvChecks, iosArgvChecks } from "./lib/argvChecks";
import androidProc from "./lib/android";
import iosProc from "./lib/ios";
import { androidSettingsChecks } from "./lib/settingsChecks";

import { Arguments } from "./types/arguments";
import { Settings } from "./types/settings";

const argv: Arguments = yargs.options({
  bldSettings: { type: "string" },
  bundle: { type: "string" },
  gradlePath: { type: "string" },
  gradleWPath: { type: "string" },
  iosPath: { type: "string" }
}).argv;

(async () => {
  argvChecks(argv);
  const sets: Settings = await import(
    path.join(process.cwd(), argv.bldSettings)
  );

  if (argv._[0] === "android") {
    androidArgvChecks(argv);
    androidSettingsChecks(sets, argv.bldSettings);
    androidProc(argv.gradlePath, argv.gradleWPath, argv.bundle, sets);
  } else if (argv._[0] === "ios") {
    iosArgvChecks(argv);
    iosProc(argv.iosPath, sets);
  }
})();
