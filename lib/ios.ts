import path from "path";
import { Settings } from "../types/settings";

export default function iosProc(iosPath: string, sets: Settings) {
  const plistPath = iosPath || path.join(process.cwd(), "./ios/");
}
