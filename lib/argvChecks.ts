import { Arguments } from "../types/arguments";
import { warning, error } from "./log";

export function argvChecks(argv: Arguments) {
  if (!argv.bldSettings) {
    error(
      "\n\nYou must specify your build settings through --bldSettings ./your/file\n"
    );
    return;
  }

  if (!argv._[0]) {
    error(
      "\n\nYou must specify which platform you want to build.\nUse rnp android or rnp ios\n"
    );
    return;
  }
}

export function androidArgvChecks(argv: Arguments) {
  if (!argv["gradlePath"]) {
    warning(
      "build.gradle path defaulting to ./android/app/build.gradle\nIf you want a different path specify it with --gradlePath"
    );
  }
  if (!argv["gradleWPath"]) {
    warning(
      "gradleW path defaulting to ./android/gradlew\nIf you want a different path specify it with --gradleWPath"
    );
  }
}

export function iosArgvChecks(argv: Arguments) {
  if (!argv.iosPath) {
    warning("Ios path defaulting to ./ios");
  }
}
