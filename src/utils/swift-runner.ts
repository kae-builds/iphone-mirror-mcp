import { execFile } from "node:child_process";
import { ScriptError } from "./errors.js";

/** Execute inline Swift code via `swift -e` and return stdout */
export function runSwift(code: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      "swift",
      ["-e", code],
      { timeout: 15_000 },
      (err, stdout, stderr) => {
        if (err) {
          reject(new ScriptError(code, stderr || err.message));
          return;
        }
        resolve(stdout.trim());
      }
    );
  });
}
