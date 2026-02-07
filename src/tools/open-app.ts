import { z } from "zod";
import { openSpotlight } from "../core/menu.js";
import { typeText, tap, pressKey } from "../core/input.js";

export const openAppTool = {
  name: "open_app",
  description: "Open an app by name on iPhone. Uses Spotlight search + clipboard paste to bypass IME issues, then taps the first result.",
  inputSchema: z.object({
    name: z.string().describe("App name to search for (e.g. '設定', 'Safari', 'LINE')"),
  }),
  handler: async (args: { name: string }) => {
    await openSpotlight();
    await new Promise(r => setTimeout(r, 600));

    await typeText(args.name);
    await new Promise(r => setTimeout(r, 1200));

    // Tap the first Spotlight result (below the search bar ~18% from top)
    await tap(0.5, 0.18);
    await new Promise(r => setTimeout(r, 500));

    return {
      content: [
        {
          type: "text" as const,
          text: `Opened Spotlight and searched for "${args.name}", tapped first result.`,
        },
      ],
    };
  },
};
