import { z } from "zod";
import { goHome } from "../core/menu.js";

export const homeTool = {
  name: "home",
  description: "Navigate to the iPhone Home Screen via menu action.",
  inputSchema: z.object({}),
  handler: async () => {
    await goHome();
    return {
      content: [{ type: "text" as const, text: "Navigated to Home Screen." }],
    };
  },
};
