import { execFile } from "node:child_process";
import { readFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { getWindowId, getWindowBounds } from "./window.js";
import { CaptureError } from "../utils/errors.js";
import type { ScreenshotResult } from "../types.js";

/** Capture the iPhone Mirroring window and return base64 PNG */
export async function captureWindow(): Promise<ScreenshotResult> {
  const windowId = await getWindowId();
  const bounds = await getWindowBounds();
  const tmpFile = join(tmpdir(), `iphone-mirror-${randomBytes(4).toString("hex")}.png`);

  try {
    await new Promise<void>((resolve, reject) => {
      execFile(
        "screencapture",
        ["-l", String(windowId), "-o", "-x", tmpFile],
        { timeout: 10_000 },
        (err) => {
          if (err) reject(new CaptureError(err.message));
          else resolve();
        }
      );
    });

    const buf = await readFile(tmpFile);
    const base64 = buf.toString("base64");

    return {
      base64,
      width: bounds.width,
      height: bounds.height,
      format: "png",
    };
  } finally {
    unlink(tmpFile).catch(() => {});
  }
}
