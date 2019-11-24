import path from "path";
import prompts from "prompts";
import { readFileSync, writeFileSync } from "fs";
import { spawn } from "child_process";

import { Settings } from "../types/settings";
import { info, error } from "../utils/log";

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
  const currentVersionName = gradleFile.match(versionNameRegExp);
  const currentVersionCode = gradleFile.match(versionCodeRegExp);

  if (!currentVersionName || !currentVersionCode) {
    throw new Error(`In your build.gradle there must be a versionCode and a versionNumber specified like this:
    defaultConfig {
      ...
      versionCode 1
      versionName "1.0.0"
    }`);
  }

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
    ANDROID_APP_ID
  } = bldSettings;

  const waitCommand = `node -e "console.log('Press any key to exit'); process.stdin.setRawMode(true); process.stdin.resume(); process.stdin.on('data', process.exit.bind(process, 1));"`;

  const cwd: string = path.dirname(gradleWPath);
  const terminal: string | undefined = process.env.TERM_PROGRAM;

  let proc: any;

  if (/^win/.test(process.platform)) {
    const buildCommand = `cmd.exe /C "${path.basename(
      gradleWPath
    )} clean ${bundleType} -PANDROID_APP_ID=${ANDROID_APP_ID} -PMYAPP_RELEASE_STORE_FILE=${KEYSTORE_FILE} -PMYAPP_RELEASE_KEY_ALIAS=${KEYSTORE_ALIAS} -PMYAPP_RELEASE_STORE_PASSWORD=${KEYSTORE_PWD} -PMYAPP_RELEASE_KEY_PASSWORD=${KEY_PWD} || ${waitCommand}"`;

    proc = spawn(buildCommand, {
      cwd,
      detached: true,
      shell: true,
      stdio: [0, "pipe", "pipe"]
    });
  } else if (process.platform === "darwin") {
    const buildCommand = `
    #!/bin/bash
    cd ${cwd}
    ./${path.basename(
      gradleWPath
    )} clean ${bundleType} -PANDROID_APP_ID=${ANDROID_APP_ID} -PMYAPP_RELEASE_STORE_FILE=${KEYSTORE_FILE} -PMYAPP_RELEASE_KEY_ALIAS=${KEYSTORE_ALIAS} -PMYAPP_RELEASE_STORE_PASSWORD=${KEYSTORE_PWD} -PMYAPP_RELEASE_KEY_PASSWORD=${KEY_PWD}`;

    writeFileSync(path.join(__dirname, "android-build.command"), buildCommand, {
      encoding: "utf8",
      flag: "w"
    });

    proc = spawn("open", [path.join(__dirname, "android-build.command")], {
      cwd,
      shell: true
    });
  } else if (process.platform === "linux") {
  }

  proc.on("exit", function(code: Buffer) {
    if (code.toString() === "0") {
      info(
        "Android build finished. Build will be at android/app/build/outputs/[apk/app-release.apk]/[aab/app.aab]"
      );
    } else {
      error("A problem occurred while building");
    }
    process.exit();
  });

  proc!.stderr!.on("data", function(data: any) {
    console.log(data.toString());
  });
  proc!.stdout!.on("data", (data: any) => {
    console.log(data.toString());
  });
}
