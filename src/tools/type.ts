import { z } from "zod";
import { typeText } from "../core/input.js";

export const typeTool = {
  name: "type_text",
  description: "Type text on the iPhone. The iPhone Mirroring window must be focused and a text field must be active.",
  inputSchema: z.object({
    text: z.string().describe("Text to type"),
  }),
  handler: async (args: { text: string }) => {
    await typeText(args.text);
    return {
      content: [
        {
          type: "text" as const,
          text: `Typed: "${args.text}"`,
        },
      ],
    };
  },
};
