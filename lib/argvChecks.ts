import { Arguments } from "../types/arguments";

export function argvChecks(argv: Arguments) {
  if (!argv.bldSettings) {
    throw new Error(
      "\nYou must specify a path to your certs file through --bldSettings ./your/path\n"
    );
  }

  if (!argv._[0]) {
    throw new Error(
      "\nYou must specify which platform you want to build.\nUse rnp android or rnp ios\n"
    );
  }
}

export function androidArgvChecks(argv: Arguments) {
  if (!argv["gradlePath"]) {
    console.warn(
      "Android build.gradle path defaulting to ./android/app/build.gradle\nIf you want a different path specify it with --gradlePath"
    );
  }
  if (!argv["gradleWPath"]) {
    console.warn(
      "Android gradleW path defaulting to ./android/gradlew\nIf you want a different path specify it with --gradleWPath"
    );
  }
}

export function iosArgvChecks(argv: Arguments) {
  if (!argv.iosPath) {
    console.warn("Ios path defaulting to ./ios");
  }
}
