import { execFile } from "node:child_process";
import { ScriptError } from "./errors.js";

/** Execute an AppleScript string and return stdout */
export function runAppleScript(script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("osascript", ["-e", script], { timeout: 10_000 }, (err, stdout, stderr) => {
      if (err) {
        reject(new ScriptError(script, stderr || err.message));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

/** Execute a JXA (JavaScript for Automation) string and return stdout */
export function runJXA(script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("osascript", ["-l", "JavaScript", "-e", script], { timeout: 10_000 }, (err, stdout, stderr) => {
      if (err) {
        reject(new ScriptError(script, stderr || err.message));
        return;
      }
      resolve(stdout.trim());
    });
  });
}
