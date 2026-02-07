# iphone-mirror-mcp

MCP server for controlling iPhone Mirroring on macOS Sequoia from Claude Code.

## Requirements

- macOS 15 (Sequoia) or later
- iPhone Mirroring configured and working
- Accessibility permissions for the terminal app

## Installation

```bash
pnpm install
pnpm run build
```

## Usage with Claude Code

Add to `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "iphone-mirror": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/iphone-mirror-mcp/dist/index.js"]
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `launch` | Launch iPhone Mirroring or bring to front |
| `status` | Check running state, window position & size |
| `screenshot` | Capture the iPhone screen as PNG |
| `tap` | Tap at normalized (0-1) coordinates |
| `swipe` | Swipe gesture between two points |
| `type_text` | Type text into active text field |
| `press_key` | Press special keys (return, escape, arrows, etc.) |
| `home` | Navigate to Home Screen |
| `app_switcher` | Open App Switcher |
| `spotlight` | Open Spotlight Search |

## Coordinate System

All coordinate-based tools use **normalized coordinates** (0-1):

- `(0, 0)` = top-left corner
- `(1, 1)` = bottom-right corner
- `(0.5, 0.5)` = center of screen

## Architecture

```
src/
├── index.ts          # MCP server entry point
├── types.ts          # Shared type definitions
├── core/
│   ├── window.ts     # Window detection & management
│   ├── capture.ts    # Screenshot capture
│   ├── input.ts      # Mouse/keyboard input via CGEvent & AppleScript
│   └── menu.ts       # Locale-aware menu operations
├── tools/            # MCP tool definitions
│   ├── screenshot.ts, status.ts, launch.ts
│   ├── tap.ts, swipe.ts, type.ts, key.ts
│   └── home.ts, app-switcher.ts, spotlight.ts
└── utils/
    ├── osascript.ts  # AppleScript/JXA runner
    ├── swift-runner.ts # Inline Swift runner
    └── errors.ts     # Custom error types
```

## How It Works

- **Window detection**: Swift + CoreGraphics API to find the iPhone Mirroring window ID
- **Screenshots**: `screencapture -l` with window ID for reliable capture
- **Mouse input**: JXA CGEvent API (no external dependencies)
- **Keyboard input**: AppleScript `keystroke` / `key code`
- **Menu actions**: AppleScript with locale-aware fallback (Japanese → English)

## License

MIT
