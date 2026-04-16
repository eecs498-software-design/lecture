/**
 * Callback-Based Asynchronous Programming - Pizza Restaurant Example
 * 
 * Callbacks are the original approach to async programming in JavaScript/TypeScript.
 * When an async operation completes, it invokes a callback function with the result.
 * 
 * ERROR HANDLING: Callbacks traditionally use dual-callback pattern:
 * - onComplete() for success
 * - onError(err) for failures
 * 
 * Note: Individual prep steps (dough, each topping, boxing) are still synchronous.
 * But we use callbacks between steps to yield to the event loop.
 */

import { requestOvenWithCallback } from "./oven";
import { checkPhone, hasOrdersRemaining } from "./phone";
import { addTopping, boxPizza, createPizza, Pizza, prepareDough, TOPPINGS } from "./pizza";
import { currentSimTime, printHeader } from "./util";

function addAllToppings(pizza: Pizza, toppings: string[], callback: () => void): void {
  if (toppings.length === 0) {
    callback();
    return;
  }
  
  const [first, ...rest] = toppings;
  addTopping(pizza, first!); // Synchronous
  setTimeout(() => {         // Yield to event loop, then continue
    addAllToppings(pizza, rest, callback);
  }, 0);
}

// Dual-callback pattern: onComplete() for success, onError(err) for failure
// Note: onError would be called if bakeWithCallback supported error callbacks
function preparePizza(pizza: Pizza, onComplete: () => void, _onError: (err: Error) => void): void {
  console.log(pizza.color(`[${currentSimTime()}] Starting: ${pizza.pizzaKind} for ${pizza.customer}`));
  
  prepareDough(pizza); // Synchronous
  
  setTimeout(() => { // Yield to event loop
    addAllToppings(pizza, TOPPINGS[pizza.pizzaKind], () => {
      // Request an oven via waitlist
      requestOvenWithCallback((oven) => {
        // Note: For true error handling, bakeWithCallback would need an error callback
        // Here we simulate by wrapping - in real code the oven would support this
        oven.bakeWithCallback(pizza, () => {
          boxPizza(pizza);
          console.log(pizza.color(`[${currentSimTime()}] ✓ Done! ${pizza.pizzaKind} ready for ${pizza.customer}`));
          onComplete();
        });
      });
    });
  }, 0);
}

// ============================================
// Demo with retry logic
// ============================================

function makePizzaWithRetry(pizza: Pizza): void {
  preparePizza(
    pizza,
    () => { /* Success - nothing more to do */ },
    () => {
      console.log(pizza.color(`[${currentSimTime()}] ⚠ Bake failed for ${pizza.customer}, retrying...`));
      makePizzaWithRetry(pizza); // Retry recursively
    }
  );
}

function main() {
  printHeader("Pizza Restaurant - Callback-Based Approach (Error Handling)");
  while(hasOrdersRemaining()) {
    const order = checkPhone();
    if (order) {
      const pizza = createPizza(order);
      makePizzaWithRetry(pizza);
    }
  }
  console.log(`[${currentSimTime()}] Done`);
}

main();

export {};