#!/usr/bin/env node

const yargs = require("yargs");
import path from "path";

import {
  argvChecks,
  androidArgvChecks,
  iosArgvChecks
} from "./utils/argvChecks";
import androidProc from "./lib/android";
import iosProc from "./lib/ios";
import {
  androidSettingsChecks,
  iosSettingsChecks
} from "./utils/settingsChecks";

import { Arguments } from "./types/arguments";
import { Settings } from "./types/settings";
import { error } from "./utils/log";

const argv: Arguments = yargs.options({
  bldSettings: { type: "string" },
  bundle: { type: "string" },
  gradlePath: {
    type: "string",
    default: "./android/app/build.gradle"
  },
  gradleWPath: {
    type: "string",
    default: "./android/gradlew"
  },
  iosPath: { type: "string", default: "./ios/" },
  iosExportOptions: { type: "string", default: "./exportOptions.plist" },
  xcodeproj: { type: "boolean", default: false }
}).argv;

(async () => {
  try {
    argvChecks(argv);

    const sets: Settings = require(path.join(process.cwd(), argv.bldSettings));
    argv.gradlePath = path.join(process.cwd(), argv.gradlePath);
    argv.gradleWPath = path.join(process.cwd(), argv.gradleWPath);
    argv.iosPath = path.join(process.cwd(), argv.iosPath);
    argv.iosExportOptions = path.join(process.cwd(), argv.iosExportOptions);

    if (argv._[0] === "android") {
      androidArgvChecks(argv);
      androidSettingsChecks(sets, argv.bldSettings);
      await androidProc(argv.gradlePath, argv.gradleWPath, argv.bundle, sets);
    } else if (argv._[0] === "ios") {
      iosArgvChecks(argv);
      iosSettingsChecks(sets, argv.bldSettings);
      await iosProc(argv.iosPath, argv.iosExportOptions, argv.xcodeproj, sets);
    }
  } catch (e) {
    error(e.message);
  }
})();
