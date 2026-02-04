export function sleepBlocking(ms: number): void {
  let timeUpTo = Date.now() + ms;
  while (Date.now() < timeUpTo) {
    // busy wait
  }
}

export async function sleepNonBlocking(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}