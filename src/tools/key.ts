import { z } from "zod";
import { pressKey } from "../core/input.js";

export const keyTool = {
  name: "press_key",
  description: "Press a special key (return, escape, delete, tab, space, arrow keys, etc.) with optional modifiers (command, option, control, shift).",
  inputSchema: z.object({
    key: z.string().describe("Key name: return, escape, delete, tab, space, up, down, left, right, home, end, pageup, pagedown, volumeup, volumedown"),
    modifiers: z.array(z.enum(["command", "option", "control", "shift"])).optional().default([]).describe("Modifier keys to hold"),
  }),
  handler: async (args: { key: string; modifiers?: string[] }) => {
    await pressKey(args.key, args.modifiers);
    return {
      content: [
        {
          type: "text" as const,
          text: `Pressed: ${args.modifiers?.length ? args.modifiers.join("+") + "+" : ""}${args.key}`,
        },
      ],
    };
  },
};
