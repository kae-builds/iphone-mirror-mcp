import { z } from "zod";
import { launch, isRunning } from "../core/window.js";

export const launchTool = {
  name: "launch",
  description: "Launch iPhone Mirroring application. If already running, brings it to the front.",
  inputSchema: z.object({}),
  handler: async () => {
    const wasRunning = await isRunning();
    await launch();
    return {
      content: [
        {
          type: "text" as const,
          text: wasRunning
            ? "iPhone Mirroring was already running. Brought to front."
            : "iPhone Mirroring launched successfully.",
        },
      ],
    };
  },
};
