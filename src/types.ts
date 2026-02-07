/** Window bounds returned by AppleScript/CGWindow queries */
export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Screenshot result with base64-encoded image */
export interface ScreenshotResult {
  base64: string;
  width: number;
  height: number;
  format: "png";
}

/** iPhone Mirroring application status */
export interface MirrorStatus {
  running: boolean;
  windowBounds: WindowBounds | null;
  windowId: number | null;
}

/** Coordinate on the iPhone screen (0-1 normalized or pixel) */
export interface Point {
  x: number;
  y: number;
}

/** Swipe gesture parameters */
export interface SwipeParams {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  durationMs?: number;
}
