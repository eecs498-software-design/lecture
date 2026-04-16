/**
 * Synchronous/Sequential - Pizza Restaurant Example
 * 
 * This is the baseline: plain, blocking, sequential code.
 * The worker does one thing at a time: answer phone OR make pizza.
 * 
 * ERROR HANDLING: Use traditional try/catch.
 * Simple and familiar - just wrap the potentially failing code.
 */

import { THE_FOUR_OVENS } from "./oven";
import { checkPhone, hasOrdersRemaining } from "./phone";
import { addTopping, boxPizza, createPizza, Pizza, prepareDough } from "./pizza";
import { currentSimTime, printHeader } from "./util";

function addAllToppings(pizza: Pizza): void {
  for (const topping of pizza.toppings) {
    addTopping(pizza, topping);
  }
}

function preparePizza(pizza: Pizza): void { // may throw
  console.log(pizza.color(`[${currentSimTime()}] Starting: ${pizza.pizzaKind} for ${pizza.customer}`));
  // allocate a box
  prepareDough(pizza);
  addAllToppings(pizza);
  THE_FOUR_OVENS[0].bakeBlocking(pizza); // may throw
  boxPizza(pizza);
  // finally release box

  console.log(pizza.color(`[${currentSimTime()}] ✓ Done! ${pizza.pizzaKind} ready for ${pizza.customer}`));
}

function main() {

  printHeader("Pizza Restaurant - No Concurrency (Error Handling)");
  while (hasOrdersRemaining()) {
    const order = checkPhone();
    if (order) {
      let pizza = createPizza(order);
      
      // Error handling: retry on bake failure
      while (true) {
        try {
          preparePizza(pizza);
          break; // Success!
        } catch (e) {
          console.log(pizza.color(`[${currentSimTime()}] ⚠ Bake failed for ${pizza.customer}, retrying...`));
          // Loop will retry
          pizza = createPizza(order); // Reset pizza state for retry
        }
      }
    }
  }
  console.log(`[${currentSimTime()}] Done`);

}

main();

export {};
