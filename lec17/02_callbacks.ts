/**
 * Callback-Based Asynchronous Programming - Pizza Restaurant Example
 * 
 * Callbacks are the original approach to async programming in JavaScript/TypeScript.
 * When an async operation completes, it invokes a callback function with the result.
 * 
 * THE PHONE ADVANTAGE: With callbacks and the event loop, phone calls are
 * just another event! They get queued and processed automatically.
 * No calls are missed because the event loop handles everything.
 * 
 * Note: Individual prep steps (dough, each topping, boxing) are still synchronous.
 * But we use callbacks between steps to yield to the event loop.
 */

import { THE_FOUR_OVENS } from "./oven";
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

function preparePizza(pizza: Pizza, onComplete: () => void): void {
  console.log(pizza.color(`[${currentSimTime()}] Starting: ${pizza.pizzaKind} for ${pizza.customer}`));
  
  prepareDough(pizza); // Synchronous
  
  setTimeout(() => { // Yield to event loop
    addAllToppings(pizza, TOPPINGS[pizza.pizzaKind], () => {
      THE_FOUR_OVENS[0].bakeWithCallback(pizza, () => {
        boxPizza(pizza); // Synchronous
        console.log(pizza.color(`[${currentSimTime()}] ✓ Done! ${pizza.pizzaKind} ready for ${pizza.customer}`));
        onComplete();
      });
    });
  }, 0);
}

// ============================================
// Demo
// ============================================

function main() {
  printHeader("Pizza Restaurant - Callback-Based Approach");
  while(hasOrdersRemaining()) {
    const order = checkPhone();
    if (order) {
      const pizza = createPizza(order);
      preparePizza(pizza, () => {
        console.log(`Pizza complete!`);
      });
    }
  }
  console.log(`[${currentSimTime()}] Done`);
}

main();

export {};