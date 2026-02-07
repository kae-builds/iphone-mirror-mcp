import { runAppleScript } from "../utils/osascript.js";
import { runSwift } from "../utils/swift-runner.js";
import { MirrorNotRunningError, WindowNotFoundError } from "../utils/errors.js";
import type { WindowBounds, MirrorStatus } from "../types.js";

/**
 * Locale-aware app names.
 * CoreGraphics returns the localized process name, while
 * AppleScript `application "X"` uses the .app bundle name.
 */
const APP_NAMES_CG = ["iPhone Mirroring", "iPhoneミラーリング"];
const APP_NAME_APPLESCRIPT = "iPhone Mirroring";

/** Check if iPhone Mirroring is running */
export async function isRunning(): Promise<boolean> {
  try {
    const result = await runAppleScript(
      `tell application "System Events" to (name of processes) contains "${APP_NAME_APPLESCRIPT}"`
    );
    if (result === "true") return true;

    // Fallback: check localized name
    const result2 = await runAppleScript(
      `tell application "System Events" to (name of processes) contains "iPhoneミラーリング"`
    );
    return result2 === "true";
  } catch {
    return false;
  }
}

/** Get the window bounds of iPhone Mirroring */
export async function getWindowBounds(): Promise<WindowBounds> {
  if (!(await isRunning())) throw new MirrorNotRunningError();

  // Try both localized names
  for (const name of APP_NAMES_CG) {
    try {
      const result = await runAppleScript(`
tell application "System Events"
  tell application process "${name}"
    set w to window 1
    set {x, y} to position of w
    set {width, height} to size of w
    return (x as text) & "," & (y as text) & "," & (width as text) & "," & (height as text)
  end tell
end tell
`);
      const parts = result.split(",").map(Number);
      if (parts.length === 4 && !parts.some(isNaN)) {
        return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
      }
    } catch {
      // Try next name
    }
  }
  throw new WindowNotFoundError();
}

/** Get the CGWindow ID for screencapture -l */
export async function getWindowId(): Promise<number> {
  if (!(await isRunning())) throw new MirrorNotRunningError();

  // Use Swift + CoreGraphics — match any known localized owner name
  const namesJson = JSON.stringify(APP_NAMES_CG);
  const code = `
import CoreGraphics
import Foundation

let names: [String] = ${namesJson}
guard let windowList = CGWindowListCopyWindowInfo(.optionOnScreenOnly, kCGNullWindowID) as? [[String: Any]] else {
  exit(1)
}
for w in windowList {
  if let owner = w[kCGWindowOwnerName as String] as? String,
     names.contains(owner),
     let layer = w[kCGWindowLayer as String] as? Int,
     layer == 0,
     let wid = w[kCGWindowNumber as String] as? Int {
    print(wid)
    exit(0)
  }
}
exit(1)
`;
  const result = await runSwift(code);
  const id = parseInt(result, 10);
  if (isNaN(id)) throw new WindowNotFoundError();
  return id;
}

/** Bring iPhone Mirroring to front */
export async function ensureFrontmost(): Promise<void> {
  if (!(await isRunning())) throw new MirrorNotRunningError();

  await runAppleScript(`
tell application "${APP_NAME_APPLESCRIPT}" to activate
delay 0.3
`);
}

/** Launch iPhone Mirroring */
export async function launch(): Promise<void> {
  await runAppleScript(`
tell application "${APP_NAME_APPLESCRIPT}" to activate
delay 1
`);
}

/** Get comprehensive status */
export async function getStatus(): Promise<MirrorStatus> {
  const running = await isRunning();
  if (!running) {
    return { running: false, windowBounds: null, windowId: null };
  }

  try {
    const [bounds, windowId] = await Promise.all([
      getWindowBounds(),
      getWindowId(),
    ]);
    return { running: true, windowBounds: bounds, windowId };
  } catch {
    return { running: true, windowBounds: null, windowId: null };
  }
}
