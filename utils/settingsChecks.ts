import { Settings } from "../types/settings";
export function androidSettingsChecks(sets: Settings, setsFilename: string) {
  const keyStorePwd = sets.KEYSTORE_PWD;
  const keyPwd = sets.KEY_PWD;
  const keyAlias = sets.KEYSTORE_ALIAS;
  const AppId = sets.APP_ID;
  const keyStoreFile = sets.KEYSTORE_FILE;

  if (!keyStorePwd || !keyPwd || !keyAlias || !AppId || !keyStoreFile) {
    throw new Error(
      `\nYou must export the following variables from ${setsFilename}:\n
- KEYSTORE_FILE
- KEYSTORE_ALIAS
- KEYSTORE_PWD
- KEY_PWD
- APP_ID\n`
    );
  }
}
