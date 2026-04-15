/**
 * Shared order queue for pizza restaurant examples.
 * 
 * Orders come in via phone at scheduled times. If the worker can't
 * answer in time, the customer hangs up and the order is lost.
 */

import colors from "colors";
import { PizzaKind } from "./pizza";
import { currentSimTime } from "./util";

// Color choices for different orders
export const ORDER_COLORS = [
  colors.red, colors.green, colors.blue,
  colors.yellow, colors.magenta, colors.cyan,
];

export interface Order {
  time: number;
  customer: string;
  pizzaType: string;
  color: colors.Color;
}

let nextColorIndex = 0;
export function createOrder(simTime: number, customer: string, pizzaType: PizzaKind): Order {
  const color = ORDER_COLORS[nextColorIndex]!;
  nextColorIndex = (nextColorIndex + 1) % ORDER_COLORS.length;
  
  return { time: simTime, customer, pizzaType, color };
}

// Incoming orders (via phone) - same for all examples
// Timing designed so synchronous version misses Bob's call (comes during baking)
const INCOMING_ORDERS: Order[] = [
  createOrder(0, "Alice", "Pepperoni"),
  createOrder(2600, "Bob", "Margherita"),
  createOrder(5500, "Carol", "Hawaiian"),
  createOrder(10000, "David", "Veggie"),
];

// How long a call rings before the customer hangs up
export const CALL_TIMEOUT = 1500;

function printCallAnswered(order: Order): void {
  console.log(order.color(
    `[${currentSimTime()}] ✓ Order taken: ${order.customer}. (Waited ${currentSimTime() - order.time} on hold.)`
  ));
}

function printCallMissed(order: Order): void {
  console.log(order.color(
    `[${currentSimTime()}] ✗ Order missed: ${order.customer}. (Waited ${currentSimTime() - order.time} then hung up.)`
  ));
}

const orderQueue: Order[] = INCOMING_ORDERS.slice();
export function checkPhone(): Order | undefined {

  if (orderQueue.length === 0) {
    return undefined; // No calls waiting
  }

  const nextOrder = orderQueue[0]!;
  if (currentSimTime() < nextOrder.time) {
    return undefined; // No calls waiting yet
  }
  
  if (currentSimTime() - nextOrder.time > CALL_TIMEOUT) {
    printCallMissed(nextOrder);
    orderQueue.shift(); // Remove from queue
    return undefined; // Missed call
  } else {
    printCallAnswered(nextOrder);
    return orderQueue.shift(); // Remove from queue and return order
  }

}

export function hasOrdersRemaining() {
  return orderQueue.length > 0;
}