/**
 * Promises with .then() - Pizza Restaurant Example
 * 
 * Promises represent a value that may not be available yet.
 * Using .then() chains is cleaner than nested callbacks, but
 * not as clean as async/await. This is the intermediate step.
 * 
 * THE PHONE ADVANTAGE: Same as callbacks - the event loop handles
 * phone calls automatically between .then() continuations.
 * 
 * Note: Individual prep steps are still synchronous.
 * But we use .then() between steps to yield to the event loop.
 */

import { THE_FOUR_OVENS } from "./oven";
import { checkPhone, hasOrdersRemaining } from "./phone";
import { addTopping, boxPizza, createPizza, Pizza, prepareDough, TOPPINGS } from "./pizza";
import { currentSimTime, printHeader } from "./util";

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function addAllToppingsWithPromise(pizza: Pizza, toppings: string[]): Promise<void> {
  if (toppings.length === 0) {
    return Promise.resolve();
  }
  
  const [first, ...rest] = toppings;
  addTopping(pizza, first!); // Synchronous
  return delay(0).then(() => addAllToppingsWithPromise(pizza, rest));
}

function preparePizza(pizza: Pizza): Promise<void> {
  console.log(pizza.color(`[${currentSimTime()}] Starting: ${pizza.pizzaKind} for ${pizza.customer}`));
  
  prepareDough(pizza); // Synchronous
  
  // Chain with .then() - cleaner than callbacks, but not as clean as async/await
  return delay(0)
    .then(() => addAllToppingsWithPromise(pizza, TOPPINGS[pizza.pizzaKind]))
    .then(() => THE_FOUR_OVENS[0].bakeWithPromise(pizza))
    .then(() => {
      boxPizza(pizza); // Synchronous
      console.log(pizza.color(`[${currentSimTime()}] ✓ Done! ${pizza.pizzaKind} ready for ${pizza.customer}`));
    });
}

// Poll for phone calls
function pollPhone(): void {
  const order = checkPhone();
  if (order) {
    const pizza = createPizza(order);
    preparePizza(pizza); // Returns a promise, but we don't wait for it
  }
  
  if (hasOrdersRemaining()) {
    setTimeout(pollPhone, 0); // Keep polling
  }
}

// ============================================
// Demo
// ============================================

function main() {
  printHeader("Pizza Restaurant - Promises with .then()");
  pollPhone();
}

main();

export {};
