import { z } from "zod";
import { captureWindow } from "../core/capture.js";
import { ocrImage } from "../core/ocr.js";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

export const screenshotTool = {
  name: "screenshot",
  description: "Capture a screenshot of the iPhone Mirroring window. Returns a base64-encoded PNG image. Set ocr=true to also extract text from the screen with positions.",
  inputSchema: z.object({
    ocr: z.boolean().optional().default(false).describe("Also run OCR to extract text with (x%,y%) positions"),
  }),
  handler: async (args: { ocr?: boolean }) => {
    const result = await captureWindow();

    const content: Array<
      | { type: "image"; data: string; mimeType: string }
      | { type: "text"; text: string }
    > = [
      {
        type: "image",
        data: result.base64,
        mimeType: "image/png",
      },
      {
        type: "text",
        text: `Screenshot captured (${result.width}x${result.height})`,
      },
    ];

    if (args.ocr) {
      const tmpFile = join(tmpdir(), `iphone-ocr-${randomBytes(4).toString("hex")}.png`);
      try {
        await writeFile(tmpFile, Buffer.from(result.base64, "base64"));
        const ocrText = await ocrImage(tmpFile);
        content.push({
          type: "text",
          text: `--- OCR Results ---\n${ocrText}`,
        });
      } finally {
        unlink(tmpFile).catch(() => {});
      }
    }

    return { content };
  },
};
