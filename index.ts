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
  gradlePath: { type: "string" },
  gradleWPath: { type: "string" },
  iosPath: { type: "string" }
}).argv;

(async () => {
  argvChecks(argv);
  const sets: Settings = await import(
    path.join(process.cwd(), argv.bldSettings)
  );

  // TODO need to await on both

  if (argv._[0] === "android") {
    androidArgvChecks(argv);
    androidSettingsChecks(sets, argv.bldSettings);
    try {
      await androidProc(argv.gradlePath, argv.gradleWPath, sets);
      console.log(
        "Android build finished. Apk will be at android/app/build/outputs/apk/app-release.apk"
      );
    } catch (e) {
      console.error(e);
    }
  } else if (argv._[0] === "ios") {
    iosArgvChecks(argv);
    iosProc(argv.iosPath, sets);
  }
})();
