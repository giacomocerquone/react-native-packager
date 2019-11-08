import path from "path";
import prompts from "prompts";
import { readFileSync, writeFileSync } from "fs";
import { spawn } from "child_process";

import { Settings } from "../types/settings";
import { info, error } from "./log";

export default async function androidProc(
  gradle: string,
  gradleW: string,
  bundle: string,
  bldSettings: Settings
) {
  const gradlePath =
    gradle || path.join(process.cwd(), "./android/app/build.gradle");
  const gradleWPath = gradleW || path.join(process.cwd(), "./android/gradlew");
  const bundleType = bundle === "aab" ? "bundleRelease" : "assembleRelease";

  let gradleFile: string;

  try {
    gradleFile = readFileSync(gradlePath, "utf8");
  } catch (e) {
    error("No gradle file found, specify it with --gradlePath");
    throw e;
  }

  const versionNameRegExp = /versionName (["'])(.*)["']/;
  const versionCodeRegExp = /versionCode (\d+)/;

  const answers = await prompts([
    {
      type: "text",
      name: "versionName",
      message: `Insert new Version Name (current ${
        gradleFile.match(versionNameRegExp)![0]
      } )`
    },
    {
      type: "number",
      name: "versionCode",
      message: `Insert new Version Code (current ${
        gradleFile.match(versionCodeRegExp)![0]
      } )`
    }
  ]);

  if (!answers.versionName || !answers.versionCode) {
    error("you must specify a versionName and versionCode");
    return;
  }

  gradleFile = gradleFile.replace(
    versionNameRegExp,
    `versionName "${answers.versionName}"`
  );

  gradleFile = gradleFile.replace(
    versionCodeRegExp,
    `versionCode ${answers.versionCode}`
  );

  try {
    writeFileSync(gradlePath, gradleFile);
  } catch (e) {
    error("Error while writing on the gradle file");
    throw e;
  }

  const {
    KEYSTORE_FILE,
    KEYSTORE_ALIAS,
    KEYSTORE_PWD,
    KEY_PWD,
    APP_ID
  } = bldSettings;

  const proc = spawn(
    `${path.basename(
      gradleWPath
    )} clean ${bundleType} -PANDROID_APP_ID=${APP_ID} -PMYAPP_RELEASE_STORE_FILE=${KEYSTORE_FILE} -PMYAPP_RELEASE_KEY_ALIAS=${KEYSTORE_ALIAS} -PMYAPP_RELEASE_STORE_PASSWORD=${KEYSTORE_PWD} -PMYAPP_RELEASE_KEY_PASSWORD=${KEY_PWD}`,
    {
      cwd: path.dirname(gradleWPath),
      shell: true,
      detached: false, // TODO I wish the terminal to stay put when erroring instead of closing itself
      stdio: [0, "pipe", "pipe"]
    }
  );

  proc.on("exit", function(code: Buffer) {
    if (code.toString() === "0") {
      info(
        "Android build finished. Apk will be at android/app/build/outputs/apk/app-release.apk"
      );
    } else {
      error("A problem occurred while building");
    }
    process.exit();
  });

  proc!.stderr!.on("data", function(data) {
    console.log(data.toString());
  });
  proc!.stdout!.on("data", data => {
    console.log(data.toString());
  });
}
