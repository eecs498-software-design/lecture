/**
 * Generators as Coroutines - Pizza Restaurant Example
 * 
 * Generators provide a way to pause and resume execution, which can be
 * used to model cooperative multitasking (coroutines). Each "yield" is
 * a suspension point where control returns to the scheduler.
 * 
 * This demonstrates two kinds of work:
 * - CPU-bound (prep, toppings, boxing): Busy-wait, blocks the cook
 * - I/O-bound (baking): Start oven, poll for completion, yields to other tasks
 * 
 * THE PHONE PROBLEM: We can only answer at yield points!
 * During CPU-bound work, we're blocked and calls time out.
 * During I/O polling, we yield frequently and can answer.
 */

import { INCOMING_ORDERS, CALL_TIMEOUT, ORDER_COLORS, Order, formatElapsed, printCallRinging, printCallAnswered, printCallMissed } from "./phone";

type Coroutine = Generator<void, void, void>;

const TIMES = {
  prepareDough: 1500,  // CPU-bound: cook works
  addToppings: 1000,   // CPU-bound: cook works
  bake: 2000,          // I/O-bound: oven works, cook can do other things
  box: 500,            // CPU-bound: cook works
};

let startTime: number;
function elapsed(): string {
  return formatElapsed(startTime);
}

// ============================================
// Order queue - populated by answering phone
// ============================================

type QueuedOrder = Order & { color: (s: string) => string };
const orderQueue: QueuedOrder[] = [];
const handledCalls = new Set<number>();
let nextColorIndex = 0;

function checkPhone(): void {
  const now = Date.now() - startTime;
  
  for (let i = 0; i < INCOMING_ORDERS.length; i++) {
    const order = INCOMING_ORDERS[i]!;
    if (handledCalls.has(i)) continue;
    
    if (now >= order.time && now < order.time + CALL_TIMEOUT) {
      printCallRinging(order);
      printCallAnswered(startTime);
      orderQueue.push({ ...order, color: ORDER_COLORS[nextColorIndex++ % ORDER_COLORS.length]! });
      handledCalls.add(i);
    }
    else if (now >= order.time + CALL_TIMEOUT) {
      printCallMissed(startTime, order);
      handledCalls.add(i);
    }
  }
}

// ============================================
// Oven and work simulation
// ============================================

class Oven {
  private doneAt: number | null = null;
  
  startBaking(durationMs: number): void {
    this.doneAt = Date.now() + durationMs;
  }
  
  checkIfDone(): boolean {
    return this.doneAt !== null && Date.now() >= this.doneAt;
  }
}

/**
 * CPU-bound work: busy waits for the duration.
 * This blocks - no other coroutine can run, can't answer phone!
 */
function doCpuWork(durationMs: number): void {
  const endTime = Date.now() + durationMs;
  while (Date.now() < endTime) {
    // busy wait
  }
}

/**
 * A generator function that models making a single pizza.
 */
function* makePizza(order: QueuedOrder): Coroutine {
  const { color } = order;
  console.log(color(`[${elapsed()}] Starting: ${order.pizzaType} for ${order.customer}`));
  
  // CPU-bound: cook is working (BLOCKS - can't answer phone!)
  console.log(color(`[${elapsed()}]   Preparing dough...`));
  doCpuWork(TIMES.prepareDough);
  yield;
  
  console.log(color(`[${elapsed()}]   Adding toppings...`));
  doCpuWork(TIMES.addToppings);
  yield;
  
  // I/O-bound: oven does the work (yields frequently - CAN answer phone!)
  console.log(color(`[${elapsed()}]   In oven...`));
  const oven = new Oven();
  oven.startBaking(TIMES.bake);
  
  while (!oven.checkIfDone()) {
    yield; // Let scheduler check phone and run other tasks
  }
  console.log(color(`[${elapsed()}]   Out of oven!`));
  
  // CPU-bound again
  console.log(color(`[${elapsed()}]   Boxing...`));
  doCpuWork(TIMES.box);
  
  console.log(color(`[${elapsed()}] ✓ Done! ${order.pizzaType} ready for ${order.customer}`));
}

/**
 * Scheduler that runs coroutines cooperatively.
 * Checks phone at each yield point!
 */
function runScheduler() {
  const tasks: Coroutine[] = [];
  
  while (tasks.length > 0 || handledCalls.size < INCOMING_ORDERS.length) {
    checkPhone(); // Can answer phone between yields
    
    // Start new pizzas from queue
    while (orderQueue.length > 0) {
      tasks.push(makePizza(orderQueue.shift()!));
    }
    
    // Run each active task once
    for (let i = tasks.length - 1; i >= 0; i--) {
      const result = tasks[i]!.next();
      if (result.done) {
        tasks.splice(i, 1);
      }
    }
  }
  
  console.log(`\n[${elapsed()}] Restaurant closing!`);
}

// ============================================
// Demo
// ============================================

console.log("=".repeat(60));
console.log("Pizza Restaurant - Generator/Coroutine Approach");
console.log("=".repeat(60));
console.log();

startTime = Date.now();
runScheduler();

console.log();
console.log("=".repeat(60));
console.log("Key Observations:");
console.log("- CPU-bound work BLOCKS - can't answer phone during prep!");
console.log("- I/O-bound work (baking) yields frequently - can answer phone");
console.log("- Calls during CPU work time out and are MISSED");
console.log("- Calls during I/O polling are ANSWERED");
console.log("=".repeat(60));

export {};