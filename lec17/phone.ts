/**
 * Shared order queue for pizza restaurant examples.
 * 
 * Orders come in via phone at scheduled times. If the worker can't
 * answer in time, the customer hangs up and the order is lost.
 */

import colors from "colors";

// Color choices for different orders
export const ORDER_COLORS = [
  colors.red, colors.green, colors.blue,
  colors.yellow, colors.magenta, colors.cyan,
];

export interface Order {
  time: number;       // when the call comes in (ms from start)
  customer: string;
  pizzaType: string;
}

// Incoming orders (via phone) - same for all examples
// Timing designed so synchronous version misses Bob's call (comes during baking)
export const INCOMING_ORDERS: Order[] = [
  { time: 0, customer: "Alice", pizzaType: "Pepperoni" },
  { time: 2600, customer: "Bob", pizzaType: "Margherita" },   // During Alice's bake - will be missed by sync!
  { time: 5500, customer: "Carol", pizzaType: "Hawaiian" },
  { time: 10000, customer: "David", pizzaType: "Veggie" },
];

// How long a call rings before the customer hangs up
export const CALL_TIMEOUT = 1500;

/**
 * Format elapsed time since start.
 */
export function formatElapsed(startTime: number): string {
  return `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
}

/**
 * Print that a call is ringing (shows when call started).
 */
export function printCallRinging(order: Order): void {
  const callStartTime = (order.time / 1000).toFixed(1);
  console.log(colors.bgYellow.black(
    `[${callStartTime}s] 📞 ${order.customer} is calling to order a ${order.pizzaType}...`
  ));
}

/**
 * Print that a call was answered (shows current time).
 */
export function printCallAnswered(startTime: number): void {
  console.log(colors.bgGreen.black(
    `[${formatElapsed(startTime)}] ✓ Order taken!`
  ));
}

/**
 * Print that a call was missed (customer hung up).
 */
export function printCallMissed(startTime: number, order: Order): void {
  console.log(colors.bgRed.white(
    `[${formatElapsed(startTime)}] ✗ ${order.customer} hung up! (waited ${CALL_TIMEOUT}ms, order lost)`
  ));
}
