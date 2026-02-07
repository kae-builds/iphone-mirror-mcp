/** iPhone Mirroring is not running */
export class MirrorNotRunningError extends Error {
  constructor() {
    super("iPhone Mirroring is not running. Launch it first with the 'launch' tool.");
    this.name = "MirrorNotRunningError";
  }
}

/** iPhone Mirroring window not found */
export class WindowNotFoundError extends Error {
  constructor() {
    super("iPhone Mirroring window not found.");
    this.name = "WindowNotFoundError";
  }
}

/** Screenshot capture failed */
export class CaptureError extends Error {
  constructor(reason: string) {
    super(`Screenshot capture failed: ${reason}`);
    this.name = "CaptureError";
  }
}

/** AppleScript / JXA execution failed */
export class ScriptError extends Error {
  constructor(script: string, stderr: string) {
    super(`Script execution failed: ${stderr}`);
    this.name = "ScriptError";
  }
}

/** Input action failed */
export class InputError extends Error {
  constructor(action: string, reason: string) {
    super(`Input action '${action}' failed: ${reason}`);
    this.name = "InputError";
  }
}
