import { z } from "zod";
import { tap, longPress } from "../core/input.js";

export const tapTool = {
  name: "tap",
  description: "Tap on the iPhone screen at normalized coordinates (0-1). (0,0) is top-left, (1,1) is bottom-right.",
  inputSchema: z.object({
    x: z.number().min(0).max(1).describe("Horizontal position (0=left, 1=right)"),
    y: z.number().min(0).max(1).describe("Vertical position (0=top, 1=bottom)"),
    long: z.boolean().optional().default(false).describe("Long press instead of tap"),
    durationMs: z.number().optional().default(800).describe("Long press duration in ms"),
  }),
  handler: async (args: { x: number; y: number; long?: boolean; durationMs?: number }) => {
    if (args.long) {
      await longPress(args.x, args.y, args.durationMs);
    } else {
      await tap(args.x, args.y);
    }
    return {
      content: [
        {
          type: "text" as const,
          text: `${args.long ? "Long pressed" : "Tapped"} at (${args.x}, ${args.y})`,
        },
      ],
    };
  },
};
