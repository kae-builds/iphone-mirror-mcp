import { z } from "zod";
import { captureWindow } from "../core/capture.js";

export const screenshotTool = {
  name: "screenshot",
  description: "Capture a screenshot of the iPhone Mirroring window. Returns a base64-encoded PNG image.",
  inputSchema: z.object({}),
  handler: async () => {
    const result = await captureWindow();
    return {
      content: [
        {
          type: "image" as const,
          data: result.base64,
          mimeType: "image/png" as const,
        },
        {
          type: "text" as const,
          text: `Screenshot captured (${result.width}x${result.height})`,
        },
      ],
    };
  },
};
