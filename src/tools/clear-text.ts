import { z } from "zod";
import { pressKey } from "../core/input.js";
import { ensureFrontmost } from "../core/window.js";
import { runAppleScript } from "../utils/osascript.js";

export const clearTextTool = {
  name: "clear_text",
  description: "Clear all text in the currently focused text field (Select All + Delete).",
  inputSchema: z.object({}),
  handler: async () => {
    await ensureFrontmost();
    // Cmd+A to select all, then Delete
    await runAppleScript(`
tell application "System Events"
  keystroke "a" using command down
  delay 0.1
  key code 51
end tell
`);
    return {
      content: [{ type: "text" as const, text: "Cleared text field." }],
    };
  },
};
