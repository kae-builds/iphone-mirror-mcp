import { z } from "zod";
import { openAppSwitcher } from "../core/menu.js";

export const appSwitcherTool = {
  name: "app_switcher",
  description: "Open the iPhone App Switcher via menu action.",
  inputSchema: z.object({}),
  handler: async () => {
    await openAppSwitcher();
    return {
      content: [{ type: "text" as const, text: "Opened App Switcher." }],
    };
  },
};
