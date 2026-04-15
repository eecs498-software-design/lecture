


export function waitBlocking(durationMs: number): void {
  const endTime = Date.now() + durationMs;
  while (Date.now() < endTime) {
    // busy wait
  }
}


const startTime = Date.now();
export function currentSimTime() {
  return Date.now() - startTime;
}

export function printHeader(header: string) {
  console.log("=".repeat(60));
  console.log(header);
  console.log("=".repeat(60));
  console.log();
}