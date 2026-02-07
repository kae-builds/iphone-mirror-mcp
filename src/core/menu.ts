import { runAppleScript } from "../utils/osascript.js";
import { ensureFrontmost } from "./window.js";
import { InputError } from "../utils/errors.js";

/**
 * Locale-aware menu config.
 * Process name and menu bar item name vary by macOS locale.
 */
const PROCESS_NAMES = ["iPhoneミラーリング", "iPhone Mirroring"];
const VIEW_MENU_NAMES = ["表示", "View"];

const MENU_ITEMS: Record<string, string[]> = {
  home: ["ホーム画面", "Home Screen", "Go to Home Screen"],
  appSwitcher: ["アプリスイッチャー", "App Switcher"],
  spotlight: ["Spotlight"],
};

/** Click a menu item with locale fallback for process name, menu bar, and item */
async function clickMenuItem(menuName: string, candidates: string[]): Promise<void> {
  await ensureFrontmost();

  for (const procName of PROCESS_NAMES) {
    for (const viewName of VIEW_MENU_NAMES) {
      for (const itemName of candidates) {
        try {
          await runAppleScript(`
tell application "System Events"
  tell application process "${procName}"
    set frontmost to true
    delay 0.2
    click menu item "${itemName}" of menu 1 of menu bar item "${viewName}" of menu bar 1
  end tell
end tell
`);
          return;
        } catch {
          // Try next combination
        }
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
