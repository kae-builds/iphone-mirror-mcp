import { z } from "zod";
import { openSpotlight } from "../core/menu.js";

export const spotlightTool = {
  name: "spotlight",
  description: "Open iPhone Spotlight search via menu action. After opening, use type_text to search.",
  inputSchema: z.object({}),
  handler: async () => {
    await openSpotlight();
    return {
      content: [{ type: "text" as const, text: "Opened Spotlight search." }],
    };
  },
};
