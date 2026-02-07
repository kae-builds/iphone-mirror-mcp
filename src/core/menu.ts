import { runAppleScript } from "../utils/osascript.js";
import { ensureFrontmost } from "./window.js";
import { InputError } from "../utils/errors.js";

const APP_NAME = "iPhone Mirroring";

/**
 * Locale-aware menu item names.
 * Fallback order: ja → en → index-based
 */
const MENU_ITEMS: Record<string, string[]> = {
  // "View" menu → Home button
  home: ["ホームに移動", "Go to Home Screen", "Go Home"],
  // "View" menu → App Switcher
  appSwitcher: ["Appスイッチャー", "App Switcher"],
  // "View" menu → Spotlight
  spotlight: ["Spotlight検索", "Spotlight Search", "Spotlight"],
};

/** Click a menu item with locale fallback */
async function clickMenuItem(menuName: string, candidates: string[]): Promise<void> {
  await ensureFrontmost();

  for (const itemName of candidates) {
    try {
      await runAppleScript(`
tell application "System Events"
  tell application process "${APP_NAME}"
    set frontmost to true
    delay 0.2
    click menu item "${itemName}" of menu 1 of menu bar item "表示" of menu bar 1
  end tell
end tell
`);
      return;
    } catch {
      // Try English menu bar name
      try {
        await runAppleScript(`
tell application "System Events"
  tell application process "${APP_NAME}"
    set frontmost to true
    delay 0.2
    click menu item "${itemName}" of menu 1 of menu bar item "View" of menu bar 1
  end tell
end tell
`);
        return;
      } catch {
        // Try next candidate
      }
    }
  }

  throw new InputError(menuName, `Could not find menu item. Tried: ${candidates.join(", ")}`);
}

/** Go to iPhone Home Screen */
export async function goHome(): Promise<void> {
  await clickMenuItem("home", MENU_ITEMS.home);
}

/** Open App Switcher */
export async function openAppSwitcher(): Promise<void> {
  await clickMenuItem("appSwitcher", MENU_ITEMS.appSwitcher);
}

/** Open Spotlight Search */
export async function openSpotlight(): Promise<void> {
  await clickMenuItem("spotlight", MENU_ITEMS.spotlight);
}
