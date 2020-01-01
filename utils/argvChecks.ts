import { Arguments } from "../types/arguments";
import { warning } from "./log";

export function argvChecks(argv: Arguments) {
  if (!argv.bldSettings) {
    throw new Error(
      "You must specify your build settings through --bldSettings ./your/file\n"
    );
  }

  if (!argv._[0]) {
    throw new Error(
      "You must specify which platform you want to build.\nUse rnp android or rnp ios\n"
    );
  }
}

export function androidArgvChecks(argv: Arguments) {
  if (!argv.gradlePath) {
    warning(
      "build.gradle path defaulting to ./android/app/build.gradle\nIf you want a different path specify it with --gradlePath"
    );
  }
  if (!argv.gradleWPath) {
    warning(
      "gradleW path defaulting to ./android/gradlew\nIf you want a different path specify it with --gradleWPath"
    );
  }
  if (!argv.bundle) {
    warning(
      "Bundle defaulting to apk\nIf you want a different bundle specify it with --bundle aab/apk"
    );
  }
}

export function iosArgvChecks(argv: Arguments) {
  if (!argv.iosPath) {
    warning(
      "Ios path defaulting to ./ios\nIf you want a different path specify it with --iosPath"
    );
  }
  if (argv.xcodeproj === null || typeof argv.xcodeproj === "undefined") {
    warning(
      "Defaulting to xcworkspace\nIf you want to change between project or workspace, specify it with --xcodeproj='true/false'"
    );
  }
}
