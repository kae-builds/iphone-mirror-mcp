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

// --- Session-level window cache (30s TTL) ---

interface WindowCache {
  windowId: number;
  pid: number;
  bounds: WindowBounds;
  cachedAt: number;
}

let _cache: WindowCache | null = null;
const CACHE_TTL_MS = 30_000;

/** Single fused AppleScript: returns pid + bounds in one subprocess */
async function fetchWindowInfoFused(): Promise<{ pid: number; bounds: WindowBounds }> {
  for (const name of APP_NAMES_CG) {
    try {
      const result = await runAppleScript(`tell application "System Events"
  if not (exists process "${name}") then return "not_running"
  tell process "${name}"
    set p to unix id
    set w to window 1
    set {wx, wy} to position of w
    set {ww, wh} to size of w
    return (p as text) & "," & (wx as text) & "," & (wy as text) & "," & (ww as text) & "," & (wh as text)
  end tell
end tell`);
      if (result === "not_running") continue;
      const parts = result.split(",").map(Number);
      if (parts.length === 5 && !parts.some(isNaN)) {
        return {
          pid: parts[0],
          bounds: { x: parts[1], y: parts[2], width: parts[3], height: parts[4] },
        };
      }
    } catch {
      // Try next locale name
    }
  }
  throw new MirrorNotRunningError();
}

/** Swift + CoreGraphics window ID lookup */
async function getWindowIdSwift(): Promise<number> {
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

/** Populate cache from fused AppleScript + Swift (run in parallel) */
async function getOrPopulateCache(): Promise<WindowCache> {
  const now = Date.now();
  if (_cache && now - _cache.cachedAt < CACHE_TTL_MS) return _cache;

  try {
    const [{ pid, bounds }, windowId] = await Promise.all([
      fetchWindowInfoFused(),
      getWindowIdSwift(),
    ]);
    _cache = { windowId, pid, bounds, cachedAt: now };
    return _cache;
  } catch (e) {
    _cache = null;
    throw e;
  }
}

// --- Public API ---

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
  const cache = await getOrPopulateCache();
  return cache.bounds;
}

/** Get the CGWindow ID for screencapture -l */
export async function getWindowId(): Promise<number> {
  const cache = await getOrPopulateCache();
  return cache.windowId;
}

/** Get the Unix PID of the iPhone Mirroring process */
export async function getPid(): Promise<number> {
  const cache = await getOrPopulateCache();
  return cache.pid;
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

/** Get comprehensive status — bypasses cache for fresh data */
export async function getStatus(): Promise<MirrorStatus> {
  const running = await isRunning();
  if (!running) {
    return { running: false, windowBounds: null, windowId: null };
  }

  try {
    const [{ bounds }, windowId] = await Promise.all([
      fetchWindowInfoFused(),
      getWindowIdSwift(),
    ]);
    return { running: true, windowBounds: bounds, windowId };
  } catch {
    return { running: true, windowBounds: null, windowId: null };
  }
}
