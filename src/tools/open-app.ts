import { z } from "zod";
import { openSpotlight } from "../core/menu.js";
import { typeText, tap } from "../core/input.js";
import { captureWindow } from "../core/capture.js";
import { ocrImage } from "../core/ocr.js";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

export const openAppTool = {
  name: "open_app",
  description: "Open an app by name on iPhone. Uses Spotlight search + OCR to find and tap the correct result.",
  inputSchema: z.object({
    name: z.string().describe("App name to search for (e.g. '設定', 'Safari', 'LINE')"),
  }),
  handler: async (args: { name: string }) => {
    await openSpotlight();
    await new Promise(r => setTimeout(r, 600));

    await typeText(args.name);
    await new Promise(r => setTimeout(r, 1500));

    // OCR to find the app in search results
    const result = await captureWindow();
    const tmpFile = join(tmpdir(), `open-app-${randomBytes(4).toString("hex")}.png`);
    try {
      await writeFile(tmpFile, Buffer.from(result.base64, "base64"));
      const ocrText = await ocrImage(tmpFile);

      // Parse OCR results to find the best match
      const lines = ocrText.split("\n").filter(l => l.trim());
      let bestY = 0.18; // default fallback

      // Look for "トップヒット" section and the app name below it
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes("トップヒット") || line.includes("Top Hit")) {
          // Next line should be the app - extract y coordinate
          if (i + 1 < lines.length) {
            const match = lines[i + 1].match(/\((\d+),(\d+)\)/);
            if (match) {
              bestY = (parseInt(match[2]) + 3) / 100; // add offset for icon center
              const bestX = parseInt(match[1]) / 100;
              await tap(Math.max(bestX, 0.15), bestY);
              await new Promise(r => setTimeout(r, 1000));
              return {
                content: [{ type: "text" as const, text: `Opened "${args.name}" via Top Hit at y=${(bestY * 100).toFixed(0)}%` }],
              };
            }
          }
        }
      }

      // Fallback: find first line containing the app name
      for (const line of lines) {
        if (line.toLowerCase().includes(args.name.toLowerCase())) {
          const match = line.match(/\((\d+),(\d+)\)/);
          if (match) {
            const x = parseInt(match[1]) / 100;
            const y = parseInt(match[2]) / 100;
            await tap(Math.max(x, 0.15), y);
            await new Promise(r => setTimeout(r, 1000));
            return {
              content: [{ type: "text" as const, text: `Opened "${args.name}" at (${x},${y})` }],
            };
          }
        }
      }

      // Last resort: tap default position
      await tap(0.5, 0.18);
      await new Promise(r => setTimeout(r, 1000));
      return {
        content: [{ type: "text" as const, text: `Tapped default position for "${args.name}" (no exact OCR match)` }],
      };
    } finally {
      unlink(tmpFile).catch(() => {});
    }
  },
};
