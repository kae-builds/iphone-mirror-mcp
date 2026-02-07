# iphone-mirror-mcp

## Build & Run

```bash
pnpm install
pnpm run build    # TypeScript → dist/
pnpm run dev      # Watch mode
node dist/index.js  # Run MCP server (stdio)
```

## Architecture

- `src/index.ts` — MCP server entry point, registers all tools
- `src/core/` — Business logic (window detection, capture, input, menu)
- `src/tools/` — MCP tool definitions (one file per tool)
- `src/utils/` — Low-level helpers (osascript, swift, errors)

## Key Patterns

- All coordinates are normalized 0-1, converted to absolute in `core/input.ts`
- Window ID obtained via Swift + CoreGraphics (not AppleScript) for reliability
- Menu operations use locale fallback: Japanese names first, then English
- Error types in `utils/errors.ts` — always use these for consistent error handling

## Dependencies

- `@modelcontextprotocol/sdk` — MCP protocol
- `zod` — Schema validation
- No external native dependencies — uses built-in macOS tools (osascript, screencapture, swift)
