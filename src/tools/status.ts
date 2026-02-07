import { z } from "zod";
import { getStatus } from "../core/window.js";

export const statusTool = {
  name: "status",
  description: "Check the status of iPhone Mirroring — whether it's running, window position and size.",
  inputSchema: z.object({}),
  handler: async () => {
    const status = await getStatus();
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(status, null, 2),
        },
      ],
    };
  },
};
