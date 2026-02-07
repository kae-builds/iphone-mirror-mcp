import { runJXA, runAppleScript } from "../utils/osascript.js";
import { getWindowBounds, ensureFrontmost } from "./window.js";
import { InputError } from "../utils/errors.js";
import type { Point, SwipeParams } from "../types.js";

async function toAbsolute(normX: number, normY: number): Promise<Point> {
  const bounds = await getWindowBounds();
  return {
    x: Math.round(bounds.x + normX * bounds.width),
    y: Math.round(bounds.y + normY * bounds.height),
  };
}

/** Tap at normalized coordinates (0-1) using CGEvent */
export async function tap(normX: number, normY: number): Promise<void> {
  await ensureFrontmost();
  const { x, y } = await toAbsolute(normX, normY);

  const script = `
ObjC.import('CoreGraphics');
var point = $.CGPointMake(${x}, ${y});
var mouseDown = $.CGEventCreateMouseEvent(null, $.kCGEventLeftMouseDown, point, $.kCGMouseButtonLeft);
var mouseUp = $.CGEventCreateMouseEvent(null, $.kCGEventLeftMouseUp, point, $.kCGMouseButtonLeft);
$.CGEventPost($.kCGHIDEventTap, mouseDown);
delay(0.05);
$.CGEventPost($.kCGHIDEventTap, mouseUp);
`;
  try {
    await runJXA(script);
  } catch (e) {
    throw new InputError("tap", e instanceof Error ? e.message : String(e));
  }
}

/** Long press at normalized coordinates */
export async function longPress(normX: number, normY: number, durationMs = 800): Promise<void> {
  await ensureFrontmost();
  const { x, y } = await toAbsolute(normX, normY);

  const script = `
ObjC.import('CoreGraphics');
var point = $.CGPointMake(${x}, ${y});
var mouseDown = $.CGEventCreateMouseEvent(null, $.kCGEventLeftMouseDown, point, $.kCGMouseButtonLeft);
var mouseUp = $.CGEventCreateMouseEvent(null, $.kCGEventLeftMouseUp, point, $.kCGMouseButtonLeft);
$.CGEventPost($.kCGHIDEventTap, mouseDown);
delay(${durationMs / 1000});
$.CGEventPost($.kCGHIDEventTap, mouseUp);
`;
  try {
    await runJXA(script);
  } catch (e) {
    throw new InputError("longPress", e instanceof Error ? e.message : String(e));
  }
}

/**
 * Swipe gesture using CGEvent mouse drag.
 * Ease-in-out curve + initial nudge to distinguish from icon drag.
 */
export async function swipe(params: SwipeParams): Promise<void> {
  await ensureFrontmost();
  const from = await toAbsolute(params.fromX, params.fromY);
  const to = await toAbsolute(params.toX, params.toY);
  const steps = 20;
  const durationMs = params.durationMs ?? 300;
  const stepDelay = durationMs / 1000 / steps;

  let moveStatements = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const cx = Math.round(from.x + (to.x - from.x) * ease);
    const cy = Math.round(from.y + (to.y - from.y) * ease);
    moveStatements += `
  var p${i} = $.CGPointMake(${cx}, ${cy});
  var drag${i} = $.CGEventCreateMouseEvent(null, $.kCGEventLeftMouseDragged, p${i}, $.kCGMouseButtonLeft);
  $.CGEventPost($.kCGHIDEventTap, drag${i});
  delay(${stepDelay});`;
  }

  const script = `
ObjC.import('CoreGraphics');
var startPoint = $.CGPointMake(${from.x}, ${from.y});
var endPoint = $.CGPointMake(${to.x}, ${to.y});
var mouseDown = $.CGEventCreateMouseEvent(null, $.kCGEventLeftMouseDown, startPoint, $.kCGMouseButtonLeft);
$.CGEventPost($.kCGHIDEventTap, mouseDown);
delay(0.02);
var nudge = $.CGPointMake(${from.x + Math.sign(to.x - from.x) * 3}, ${from.y + Math.sign(to.y - from.y) * 3});
var nudgeDrag = $.CGEventCreateMouseEvent(null, $.kCGEventLeftMouseDragged, nudge, $.kCGMouseButtonLeft);
$.CGEventPost($.kCGHIDEventTap, nudgeDrag);
delay(0.01);
${moveStatements}
var mouseUp = $.CGEventCreateMouseEvent(null, $.kCGEventLeftMouseUp, endPoint, $.kCGMouseButtonLeft);
$.CGEventPost($.kCGHIDEventTap, mouseUp);
`;

  try {
    await runJXA(script);
  } catch (e) {
    throw new InputError("swipe", e instanceof Error ? e.message : String(e));
  }
}

/**
 * Type text using clipboard paste to bypass IME.
 * Saves and restores the previous clipboard content.
 */
export async function typeText(text: string): Promise<void> {
  await ensureFrontmost();
  const escaped = text.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  try {
    await runAppleScript(`
-- Save current clipboard
set prevClip to ""
try
  set prevClip to the clipboard as text
end try

set the clipboard to "${escaped}"
delay 0.1
tell application "System Events"
  keystroke "v" using command down
end tell
delay 0.15

-- Restore clipboard
try
  set the clipboard to prevClip
end try
`);
  } catch (e) {
    throw new InputError("typeText", e instanceof Error ? e.message : String(e));
  }
}

/** Press a special key using AppleScript key code */
export async function pressKey(keyName: string, modifiers: string[] = []): Promise<void> {
  await ensureFrontmost();

  const keyMap: Record<string, number> = {
    return: 36,
    enter: 76,
    tab: 48,
    space: 49,
    delete: 51,
    escape: 53,
    home: 115,
    end: 119,
    pageup: 116,
    pagedown: 121,
    up: 126,
    down: 125,
    left: 123,
    right: 124,
    volumeup: 72,
    volumedown: 73,
  };

  const keyCode = keyMap[keyName.toLowerCase()];
  if (keyCode === undefined) {
    throw new InputError("pressKey", `Unknown key: ${keyName}. Available: ${Object.keys(keyMap).join(", ")}`);
  }

  const modifierClause = modifiers.length > 0
    ? ` using {${modifiers.map(m => `${m} down`).join(", ")}}`
    : "";

  try {
    await runAppleScript(`
tell application "System Events"
  key code ${keyCode}${modifierClause}
end tell
`);
  } catch (e) {
    throw new InputError("pressKey", e instanceof Error ? e.message : String(e));
  }
}
