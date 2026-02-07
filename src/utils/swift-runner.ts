import { execFile } from "node:child_process";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { ScriptError } from "./errors.js";

/** Execute Swift code via a temp file and return stdout */
export function runSwift(code: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const tmpFile = join(tmpdir(), `iphone-mirror-swift-${randomBytes(4).toString("hex")}.swift`);
    try {
      await writeFile(tmpFile, code, "utf-8");
      execFile(
        "swift",
        [tmpFile],
        { timeout: 15_000 },
        (err, stdout, stderr) => {
          unlink(tmpFile).catch(() => {});
          if (err) {
            reject(new ScriptError(code.slice(0, 100), stderr || err.message));
          } else {
            resolve(stdout.trim());
          }
        }
      );
    } catch (e) {
      unlink(tmpFile).catch(() => {});
      reject(e);
    }
  });
}
