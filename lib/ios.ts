import path from "path";
import { Settings } from "../types/settings";
import prompts from "prompts";
import { exec } from "child_process";
import { error } from "../utils/log";

const promisifiedExec = (command: string): Promise<string> =>
  new Promise((res, rej) => {
    exec(command, (error, stdout, stderr) => {
      if (error || stderr) rej(error);
      else res(stdout);
    });
  });

export default async function iosProc(
  iosPath: string,
  xcodeproj: boolean,
  bldSettings: Settings
) {
  try {
    const absolutePlistPath = path.join(
      iosPath,
      bldSettings.IOS_PROJECT_NAME,
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

    const answers = await prompts([
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

    console.log(buildName, buildNumber);
  } catch (e) {
    error("Problemi nel leggere l'attuale versione dall'info plist");
    throw e;
  }
}
