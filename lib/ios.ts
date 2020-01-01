import path from "path";
import { Settings } from "../types/settings";
import prompts from "prompts";
import { exec, spawn } from "child_process";
import { error, info } from "../utils/log";
import { writeFileSync, chmodSync } from "fs";

const promisifiedExec = (command: string, options = {}): Promise<string> =>
  new Promise((res, rej) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error || stderr) rej(error);
      else res(stdout);
    });
  });

export default async function iosProc(
  iosPath: string,
  exportOptionsPath: string,
  xcodeproj: boolean,
  bldSettings: Settings
) {
  const { IOS_PROJECT_NAME, IOS_APP_ID, IOS_SCHEME } = bldSettings;

  if (process.platform !== "darwin") {
    throw new Error("You must be on OSX in order to build an ios app");
  }

  let answers: any;

  try {
    const absolutePlistPath = path.join(
      iosPath,
      IOS_PROJECT_NAME,
      "Info.plist"
    );

    const buildName: string = (
      await promisifiedExec(
        `defaults read ${absolutePlistPath} CFBundleVersion`
      )
    ).replace(/\n|\r/g, "");
    const buildNumber: string = (
      await promisifiedExec(
        `defaults read ${absolutePlistPath} CFBundleShortVersionString`
      )
    ).replace(/\n|\r/g, "");

    answers = await prompts([
      {
        type: "text",
        name: "buildName",
        message: `Insert new Build Name (current ${buildName})`,
        initial: buildName
      },
      {
        type: "text",
        name: "buildNumber",
        message: `Insert new Build Number (current ${buildNumber})`,
        initial: buildNumber
      }
    ]);
  } catch (e) {
    error("Problemi nel leggere l'attuale versione dall'info plist");
    throw e;
  }

  try {
    await promisifiedExec(
      `xcrun agvtool new-marketing-version ${answers.buildName}`,
      {
        cwd: iosPath
      }
    );
    await promisifiedExec(
      `xcrun agvtool new-version -all ${answers.buildNumber}`,
      { cwd: iosPath }
    );
  } catch (e) {
    error("Problemi nel settare la nuova versione nell'info plist");
    throw e;
  }

  const build = xcodeproj
    ? ``
    : `xcodebuild clean archive PRODUCT_BUNDLE_IDENTIFIER=${IOS_APP_ID} -workspace ${path.join(
        iosPath,
        `${IOS_PROJECT_NAME}.xcworkspace`
      )} -scheme ${IOS_SCHEME} -configuration RELEASE -derivedDataPath ${path.join(
        iosPath,
        "build"
      )} -archivePath ${path.join(
        iosPath,
        "build/Products",
        `${IOS_PROJECT_NAME}.xcarchive`
      )}`;

  const ipa = `xcodebuild -exportArchive -archivePath ${path.join(
    iosPath,
    "build/Products",
    `${IOS_PROJECT_NAME}.xcarchive`
  )} -exportOptionsPlist ${exportOptionsPath} -exportPath ${path.join(
    iosPath,
    "build/Products/IPA"
  )} -allowProvisioningUpdates`;

  const buildCommand = `
    #!/bin/bash
    cd ${iosPath}
    ${build}
    unset GEM_HOME
    unset GEM_PATH
    ${ipa}
`;

  writeFileSync(path.join(__dirname, "ios-build.command"), buildCommand, {
    encoding: "utf8",
    flag: "w"
  });

  chmodSync(path.join(__dirname, "ios-build.command"), "755");

  const proc = spawn("open", [path.join(__dirname, "ios-build.command")], {
    cwd: iosPath,
    shell: true
  });

  setInterval(() => {
    try {
      process.kill(+proc.pid + 1, 0); // oh shit, it works
    } catch (e) {
      info("Ios build finished.");
      process.exit();
    }
  }, 1000);
}
