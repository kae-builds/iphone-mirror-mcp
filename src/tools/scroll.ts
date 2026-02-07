import { z } from "zod";
import { swipe } from "../core/input.js";

export const scrollTool = {
  name: "scroll",
  description: "Scroll the iPhone screen in a direction. Uses safe center-area swipe to avoid triggering edge gestures or moving icons.",
  inputSchema: z.object({
    direction: z.enum(["up", "down", "left", "right"]).describe("Scroll direction (content moves this way: 'up' scrolls content up, revealing lower content)"),
    amount: z.enum(["small", "medium", "large"]).optional().default("medium").describe("Scroll distance"),
  }),
  handler: async (args: { direction: string; amount?: string }) => {
    const dist: Record<string, number> = { small: 0.15, medium: 0.3, large: 0.5 };
    const d = dist[args.amount ?? "medium"];

    // Use center area to avoid edge gestures
    const cx = 0.5, cy = 0.5;
    const vectors: Record<string, { fromX: number; fromY: number; toX: number; toY: number }> = {
      up:    { fromX: cx, fromY: cy + d / 2, toX: cx, toY: cy - d / 2 },
      down:  { fromX: cx, fromY: cy - d / 2, toX: cx, toY: cy + d / 2 },
      left:  { fromX: cx + d / 2, fromY: cy, toX: cx - d / 2, toY: cy },
      right: { fromX: cx - d / 2, fromY: cy, toX: cx + d / 2, toY: cy },
    };

    const v = vectors[args.direction];
    await swipe({ ...v, durationMs: 300 });

    return {
      content: [{ type: "text" as const, text: `Scrolled ${args.direction} (${args.amount ?? "medium"})` }],
    };
  },
};
