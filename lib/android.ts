import path from "path";
import prompts from "prompts";
import { readFileSync, writeFileSync } from "fs";
import { exec, spawnSync, execSync } from "child_process";

import { Settings } from "../types/settings";

export default async function androidProc(
  gradle: string,
  gradleW: string,
  bldSettings: Settings
) {
  const gradlePath =
    gradle || path.join(process.cwd(), "./android/app/build.gradle");
  const gradleWPath = gradleW || path.join(process.cwd(), "./android/gradlew");

  let gradleFile: string;

  try {
    gradleFile = readFileSync(gradlePath, "utf8");
  } catch (e) {
    console.error("No gradle file found, specify it with --gradlePath");
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
    throw new Error("you must specify a versionName and versionCode");
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
    console.error("Error while writing on the gradle file");
    throw e;
  }

  const {
    KEYSTORE_FILE,
    KEYSTORE_ALIAS,
    KEYSTORE_PWD,
    KEY_PWD,
    APP_ID
  } = bldSettings;

  const stdOut = execSync(
    `${path.basename(
      gradleWPath
    )} clean assembleRelease -PANDROID_APP_ID=${APP_ID} -PMYAPP_RELEASE_STORE_FILE=${KEYSTORE_FILE} -PMYAPP_RELEASE_KEY_ALIAS=${KEYSTORE_ALIAS} -PMYAPP_RELEASE_STORE_PASSWORD=${KEYSTORE_PWD} -PMYAPP_RELEASE_KEY_PASSWORD=${KEY_PWD}`,
    {
      cwd: path.dirname(gradleWPath)
    }
  );

  console.log(stdOut);
}
