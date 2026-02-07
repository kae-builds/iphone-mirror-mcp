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

## Available Tools (13)

| Tool | Description |
|------|-------------|
| `launch` | Launch iPhone Mirroring or bring to front |
| `status` | Check running state, window position & size |
| `screenshot` | Capture screen as PNG (optionally with OCR) |
| `tap` | Tap at normalized (0-1) coordinates |
| `swipe` | Swipe gesture between two points |
| `scroll` | Scroll up/down/left/right with preset distances |
| `type_text` | Type text via clipboard paste (IME-safe) |
| `clear_text` | Clear focused text field (Select All + Delete) |
| `press_key` | Press special keys with optional modifiers |
| `home` | Navigate to Home Screen |
| `app_switcher` | Open App Switcher |
| `spotlight` | Open Spotlight Search |
| `open_app` | Open app by name via Spotlight + OCR |

## Coordinate System

All coordinate-based tools use **normalized coordinates** (0-1):

- `(0, 0)` = top-left corner
- `(1, 1)` = bottom-right corner
- `(0.5, 0.5)` = center of screen

## Key Design Decisions

- **Clipboard paste for text input** — Bypasses Japanese IME interference, restores original clipboard after use
- **OCR via Vision framework** — Extracts on-screen text with `(x%, y%)` positions for element targeting
- **Locale-aware menus** — Tries Japanese names first, falls back to English
- **Safe swipe gestures** — Ease-in-out curve + initial nudge to prevent icon drag misinterpretation
- **CGEvent for mouse** — Zero external dependencies, uses macOS built-in APIs

## Architecture

```
src/
├── index.ts          # MCP server entry point
├── types.ts          # Shared type definitions
├── core/
│   ├── window.ts     # Window detection & management
│   ├── capture.ts    # Screenshot capture
│   ├── input.ts      # Mouse/keyboard input
│   ├── menu.ts       # Locale-aware menu operations
│   └── ocr.ts        # Vision framework OCR
├── tools/            # MCP tool definitions (one per file)
└── utils/
    ├── osascript.ts  # AppleScript/JXA runner
    ├── swift-runner.ts # Inline Swift runner (temp file)
    └── errors.ts     # Custom error types
```

## License

MIT
