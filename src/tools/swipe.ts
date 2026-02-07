import { z } from "zod";
import { swipe } from "../core/input.js";

export const swipeTool = {
  name: "swipe",
  description: "Swipe on the iPhone screen. Coordinates are normalized (0-1). Common patterns: swipe up from (0.5, 0.8) to (0.5, 0.2) to scroll down.",
  inputSchema: z.object({
    fromX: z.number().min(0).max(1).describe("Start X (0=left, 1=right)"),
    fromY: z.number().min(0).max(1).describe("Start Y (0=top, 1=bottom)"),
    toX: z.number().min(0).max(1).describe("End X"),
    toY: z.number().min(0).max(1).describe("End Y"),
    durationMs: z.number().optional().default(300).describe("Swipe duration in ms"),
  }),
  handler: async (args: { fromX: number; fromY: number; toX: number; toY: number; durationMs?: number }) => {
    await swipe(args);
    return {
      content: [
        {
          type: "text" as const,
          text: `Swiped from (${args.fromX}, ${args.fromY}) to (${args.toX}, ${args.toY})`,
        },
      ],
    };
  },
};
