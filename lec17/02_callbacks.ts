/**
 * Callback-Based Asynchronous Programming - Pizza Restaurant Example
 * 
 * Callbacks are the original approach to async programming in JavaScript/TypeScript.
 * When an async operation completes, it invokes a callback function with the result.
 * 
 * THE PHONE ADVANTAGE: With callbacks and the event loop, phone calls are
 * just another event! They get queued and processed automatically.
 * No calls are missed because the event loop handles everything.
 */

import { INCOMING_ORDERS, ORDER_COLORS, Order, formatElapsed, printCallRinging, printCallAnswered } from "./phone";

function doWorkAndThen(ms: number, callback: () => void): void {
  setTimeout(callback, ms);
}

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
let nextColorIndex = 0;
let activePizzas = 0;

function schedulePhoneCalls(): void {
  for (const order of INCOMING_ORDERS) {
    setTimeout(() => {
      printCallRinging(order);
      printCallAnswered(startTime);
      const queued: QueuedOrder = { ...order, color: ORDER_COLORS[nextColorIndex++ % ORDER_COLORS.length]! };
      orderQueue.push(queued);
      processNextOrder(); // Try to start making it
    }, order.time);
  }
}

// ============================================
// Making pizzas with callbacks
// ============================================

function makePizza(order: QueuedOrder, onComplete: () => void) {
  const { color } = order;
  console.log(color(`[${elapsed()}] Starting: ${order.pizzaType} for ${order.customer}`));
  
  console.log(color(`[${elapsed()}]   Preparing dough...`));
  doWorkAndThen(TIMES.prepareDough,
    () => {
      console.log(color(`[${elapsed()}]   Adding toppings...`));
      doWorkAndThen(TIMES.addToppings,
        () => {
        console.log(color(`[${elapsed()}]   Baking...`));
        doWorkAndThen(TIMES.bake,
          () => { // I/O bound, asynchronous, non-blocking
          console.log(color(`[${elapsed()}]   Boxing...`));
          doWorkAndThen(TIMES.box,
            () => {
            console.log(color(`[${elapsed()}] ✓ Done! ${order.pizzaType} ready for ${order.customer}`));
            onComplete();
          });
        });
      });
    }
  );
}

function processNextOrder() {
  if (orderQueue.length === 0) return;
  
  const order = orderQueue.shift()!;
  activePizzas++;
  
  makePizza(order, () => {
    activePizzas--;
    if (activePizzas > 0 || orderQueue.length > 0) {
      processNextOrder();
    }
  });
}

// ============================================
// Demo
// ============================================

console.log("=".repeat(60));
console.log("Pizza Restaurant - Callback-Based Approach");
console.log("=".repeat(60));
console.log();

startTime = Date.now();
schedulePhoneCalls();

export {};