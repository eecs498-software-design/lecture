/**
 * Synchronous/Sequential - Pizza Restaurant Example
 * 
 * This is the baseline: plain, blocking, sequential code.
 * The worker does one thing at a time: answer phone OR make pizza.
 */

import { INCOMING_ORDERS, CALL_TIMEOUT, ORDER_COLORS, Order, formatElapsed, printCallRinging, printCallAnswered, printCallMissed } from "./phone";

const TIMES = {
  prepareDough: 1500,
  addToppings: 1000,
  bake: 2000,
  box: 500,
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
    
    // Call is ringing - answer it!
    if (now >= order.time && now < order.time + CALL_TIMEOUT) {
      printCallRinging(order);
      printCallAnswered(startTime);
      orderQueue.push({ ...order, color: ORDER_COLORS[nextColorIndex++ % ORDER_COLORS.length]! });
      handledCalls.add(i);
    }
    // Customer hung up - order lost!
    else if (now >= order.time + CALL_TIMEOUT) {
      printCallMissed(startTime, order);
      handledCalls.add(i);
    }
  }
}

function doWork(durationMs: number): void {
  const endTime = Date.now() + durationMs;
  while (Date.now() < endTime) {
    // busy wait - can't answer phone!
  }
}

function makePizza(order: QueuedOrder): void {
  const { color } = order;
  console.log(color(`[${elapsed()}] Starting: ${order.pizzaType} for ${order.customer}`));
  
  console.log(color(`[${elapsed()}]   Preparing dough...`));
  doWork(TIMES.prepareDough);
  checkPhone();
  
  console.log(color(`[${elapsed()}]   Adding toppings...`));
  doWork(TIMES.addToppings);
  checkPhone();
  
  console.log(color(`[${elapsed()}]   Baking...`));
  doWork(TIMES.bake);
  checkPhone();
  
  console.log(color(`[${elapsed()}]   Boxing...`));
  doWork(TIMES.box);
  
  console.log(color(`[${elapsed()}] ✓ Done! ${order.pizzaType} ready for ${order.customer}`));
}

// ============================================
// Demo
// ============================================

console.log("=".repeat(60));
console.log("Pizza Restaurant - Synchronous Approach");
console.log("=".repeat(60));
console.log();

startTime = Date.now();
checkPhone(); // Get initial orders

while (orderQueue.length > 0 || handledCalls.size < INCOMING_ORDERS.length) {
  if (orderQueue.length > 0) {
    makePizza(orderQueue.shift()!);
    checkPhone();
  } else {
    doWork(100); // Wait for calls (bad!)
    checkPhone();
  }
}

console.log(`\n[${elapsed()}] Restaurant closing!`);

export {};
