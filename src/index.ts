#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { screenshotTool } from "./tools/screenshot.js";
import { statusTool } from "./tools/status.js";
import { launchTool } from "./tools/launch.js";
import { tapTool } from "./tools/tap.js";
import { swipeTool } from "./tools/swipe.js";
import { typeTool } from "./tools/type.js";
import { keyTool } from "./tools/key.js";
import { homeTool } from "./tools/home.js";
import { appSwitcherTool } from "./tools/app-switcher.js";
import { spotlightTool } from "./tools/spotlight.js";
import { openAppTool } from "./tools/open-app.js";
import { clearTextTool } from "./tools/clear-text.js";
import { scrollTool } from "./tools/scroll.js";

const server = new McpServer({
  name: "iphone-mirror-mcp",
  version: "0.3.0",
});

const tools = [
  screenshotTool,
  statusTool,
  launchTool,
  tapTool,
  swipeTool,
  scrollTool,
  typeTool,
  clearTextTool,
  keyTool,
  homeTool,
  appSwitcherTool,
  spotlightTool,
  openAppTool,
];

for (const tool of tools) {
  server.tool(tool.name, tool.description, tool.inputSchema.shape, async (args: Record<string, unknown>) => {
    try {
      return await tool.handler(args as any);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  });
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
