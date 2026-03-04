import { z } from "zod";
import { batchTap } from "../core/input.js";

export const batchTapTool = {
  name: "batch_tap",
  description:
    "Tap multiple locations on the iPhone screen in a single operation. Much faster than sequential tap() calls — use this whenever you know 2+ taps in advance (e.g. playing a card chain). Coordinates are normalized 0-1.",
  inputSchema: z.object({
    taps: z
      .array(
        z.object({
          x: z.number().min(0).max(1).describe("Horizontal position (0=left, 1=right)"),
          y: z.number().min(0).max(1).describe("Vertical position (0=top, 1=bottom)"),
          delayMs: z
            .number()
            .optional()
            .describe("Delay after this tap in ms (overrides defaultDelayMs for this tap)"),
        })
      )
      .min(1)
      .max(20)
      .describe("Array of tap points to execute in sequence"),
    defaultDelayMs: z
      .number()
      .optional()
      .default(100)
      .describe("Default delay between taps in ms (default: 100)"),
  }),
  handler: async (args: {
    taps: Array<{ x: number; y: number; delayMs?: number }>;
    defaultDelayMs?: number;
  }) => {
    const points = args.taps.map((t) => ({ normX: t.x, normY: t.y, delayMs: t.delayMs }));
    await batchTap(points, args.defaultDelayMs ?? 100);
    const coordList = args.taps.map((t) => `(${t.x}, ${t.y})`).join(", ");
    return {
      content: [
        {
          type: "text" as const,
          text: `Tapped ${args.taps.length} points: ${coordList}`,
        },
      ],
    };
  },
};
