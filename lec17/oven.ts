import { Pizza } from "./pizza";
import { currentSimTime } from "./util";

export class Oven {

  private oven_id: string;

  private currentJob?: {
    pizza: Pizza;
    startTime: number;
  } | undefined = undefined;

  public constructor(oven_id: string) {
    this.oven_id = oven_id;
  }

  public bakeBlocking(pizza: Pizza): void {
    console.log(pizza.color(`[${currentSimTime()}, ${pizza.customer}, ${this.oven_id}]   Baking...`));
    const endTime = Date.now() + pizza.bakeTime;
    while (Date.now() < endTime) {
      // busy wait - blocks the event loop!
    }
    pizza.isBaked = true;
    console.log(pizza.color(`[${currentSimTime()}, ${pizza.customer}, ${this.oven_id}]   Pizza baked!`));
  }

  public startBaking(pizza: Pizza): void {
    console.log(pizza.color(`[${currentSimTime()}, ${pizza.customer}, ${this.oven_id}]   Baking...`));
    this.currentJob = {
      pizza,
      startTime: Date.now(),
    };
    console.log(pizza.color(`[${currentSimTime()}, ${pizza.customer}, ${this.oven_id}]   Started baking!`));
  }
  
  public isAvailable(): boolean {
    return this.currentJob === undefined;
  }

  public checkIfDone(): boolean {
    if (!this.currentJob) return false;
    
    if (Date.now() - this.currentJob.startTime >= this.currentJob.pizza.bakeTime) {
      this.currentJob.pizza.isBaked = true;
      this.currentJob = undefined; // Oven is now free
      return true;
    }
    return false; // Still baking
  }

  public bakeWithCallback(pizza: Pizza, callback: () => void): void {
    this.currentJob = {
      pizza,
      startTime: Date.now(),
    };
    console.log(pizza.color(`[${currentSimTime()}, ${pizza.customer}, ${this.oven_id}]   Baking...`));
    setTimeout(() => {
      pizza.isBaked = true;
      console.log(pizza.color(`[${currentSimTime()}, ${pizza.customer}, ${this.oven_id}]   Pizza baked!`));
      callback();
      this.currentJob = undefined; // Oven is now free
      notifyNextWaiter();  // Notify waitlist
    }, pizza.bakeTime);
  }

  public bakeWithPromise(pizza: Pizza): Promise<void> {
    this.currentJob = {
      pizza,
      startTime: Date.now(),
    };
    console.log(pizza.color(`[${currentSimTime()}, ${pizza.customer}, ${this.oven_id}]   Baking...`));
    return new Promise((resolve) => {
      setTimeout(() => {
        pizza.isBaked = true;
        console.log(pizza.color(`[${currentSimTime()}, ${pizza.customer}, ${this.oven_id}]   Pizza baked!`));
        resolve();
        this.currentJob = undefined; // Oven is now free
        notifyNextWaiter();  // Notify waitlist
      }, pizza.bakeTime);
    });
  }

  async bakeAsync(pizza: Pizza): Promise<void> {
    this.currentJob = {
      pizza,
      startTime: Date.now(),
    };
    console.log(pizza.color(`[${currentSimTime()}, ${pizza.customer}, ${this.oven_id}]   Baking...`));
    await new Promise((resolve) => setTimeout(resolve, pizza.bakeTime));
    pizza.isBaked = true;
    console.log(pizza.color(`[${currentSimTime()}, ${pizza.customer}, ${this.oven_id}]   Pizza baked!`));
    this.currentJob = undefined; // Oven is now free
    notifyNextWaiter();  // Notify waitlist
  }
}

export const THE_FOUR_OVENS = [
  new Oven("Oven 1"), new Oven("Oven 2"), new Oven("Oven 3"), new Oven("Oven 4")
] as const;

export function findAvailableOven(): Oven | undefined {
  return THE_FOUR_OVENS.find(oven => oven.isAvailable());
}

// ============================================
// Waitlist-based oven allocation (for callbacks/promises)
// ============================================

type OvenCallback = (oven: Oven) => void;
const ovenWaitlist: OvenCallback[] = [];

function notifyNextWaiter(): void {
  if (ovenWaitlist.length === 0) return;
  
  const oven = findAvailableOven();
  if (oven) {
    const callback = ovenWaitlist.shift()!;
    callback(oven);
  }
}

/**
 * Request an oven via callback. If one is available now, callback is
 * invoked immediately (via setTimeout to stay async). Otherwise, you're
 * added to the waitlist and notified when an oven becomes free.
 */
export function requestOvenWithCallback(callback: OvenCallback): void {
  const oven = findAvailableOven();
  if (oven) {
    setTimeout(() => callback(oven), 0);  // Keep it async
  } else {
    ovenWaitlist.push(callback);
  }
}

/**
 * Request an oven via promise. Resolves when an oven is available.
 */
export function requestOvenWithPromise(): Promise<Oven> {
  return new Promise(resolve => requestOvenWithCallback(resolve));
}