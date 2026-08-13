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
- `src/core/` — Business logic (window detection, capture, input, menu, OCR)
- `src/tools/` — MCP tool definitions (one file per tool)
- `src/utils/` — Low-level helpers (osascript, swift, errors)

## OCR Subsystem

- `src/core/ocr.ts` exports `ocrImage(imagePath)` — runs on-device OCR over a PNG using the macOS **Vision** framework (`VNRecognizeTextRequest`)
- Swift source is generated as a string and executed via `runSwift` in `utils/swift-runner.ts` (writes a temp `.swift` file, runs `swift`, 15s timeout) — no native bindings, no cloud OCR
- Recognition config: `recognitionLevel = .accurate`, `recognitionLanguages = ["ja", "en"]`, `usesLanguageCorrection = true`
- Results are sorted top-to-bottom then left-to-right (rows within 0.03 normalized Y are treated as the same line) and returned as plain text lines formatted `(x%,y%) text`, where x/y are integer percentages of the bounding-box origin within the screenshot
- Called from two tools:
  - `tools/screenshot.ts` — optional `ocr` boolean param (default false); when true, appends `--- OCR Results ---` text to the image content
  - `tools/open-app.ts` — Spotlight search + OCR to locate the matching result on screen and tap it (falls back to a default tap position if no OCR match)

## Key Patterns

- All coordinates are normalized 0-1, converted to absolute in `core/input.ts`
- Window ID obtained via Swift + CoreGraphics (not AppleScript) for reliability
- Menu operations use locale fallback: Japanese names first, then English
- OCR uses the same Swift-via-temp-file path (`utils/swift-runner.ts`) as window detection
- Error types in `utils/errors.ts` — always use these for consistent error handling

## Dependencies

- `@modelcontextprotocol/sdk` — MCP protocol
- `zod` — Schema validation
- No external native dependencies — uses built-in macOS tools (osascript, screencapture, swift) and the macOS Vision framework (via Swift) for OCR
