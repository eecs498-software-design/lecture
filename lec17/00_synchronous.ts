/**
 * Synchronous/Sequential - Pizza Restaurant Example
 * 
 * This is the baseline: plain, blocking, sequential code.
 * The worker does one thing at a time: answer phone OR make pizza.
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

function preparePizza(pizza: Pizza): void {
  console.log(pizza.color(`[${currentSimTime()}] Starting: ${pizza.pizzaKind} for ${pizza.customer}`));

  prepareDough(pizza);
  addAllToppings(pizza);
  THE_FOUR_OVENS[0].bakeBlocking(pizza); // may throw
  boxPizza(pizza);

  console.log(pizza.color(`[${currentSimTime()}] ✓ Done! ${pizza.pizzaKind} ready for ${pizza.customer}`));
}

function main() {

  printHeader("Pizza Restaurant - No Concurrency");
  while (hasOrdersRemaining()) {
    const order = checkPhone();
    if (order) {
      const pizza = createPizza(order);
      preparePizza(pizza);
    }
  }
  console.log(`[${currentSimTime()}] Done`);

}

main();

export {};
