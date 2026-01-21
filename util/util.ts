export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg ? `Assertion failed: ${msg}` : "Assertion failed.");
  }
}

export function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}
