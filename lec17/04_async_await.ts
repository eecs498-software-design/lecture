/**
 * Async/Await - Pizza Restaurant Example
 * 
 * Async/await is syntactic sugar over Promises that makes asynchronous
 * code look and feel like synchronous code. This is the modern approach
 * and what you should use in most cases.
 * 
 * THE PHONE ADVANTAGE: Same as callbacks - the event loop handles
 * phone calls automatically. But the code is MUCH cleaner to read!
 * 
 * Note: Individual prep steps are still synchronous.
 * But we use await between steps to yield to the event loop.
 */

import { THE_FOUR_OVENS } from "./oven";
import { checkPhone, hasOrdersRemaining } from "./phone";
import { addTopping, boxPizza, createPizza, Pizza, prepareDough, TOPPINGS } from "./pizza";
import { currentSimTime, printHeader } from "./util";

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function addAllToppings(pizza: Pizza): Promise<void> {
  for (const topping of TOPPINGS[pizza.pizzaKind]) {
    addTopping(pizza, topping); // Synchronous
    await delay(0);             // Yield to event loop
  }
}

async function preparePizza(pizza: Pizza): Promise<void> {
  console.log(pizza.color(`[${currentSimTime()}] Starting: ${pizza.pizzaKind} for ${pizza.customer}`));
  
  prepareDough(pizza); // Synchronous
  await delay(0);      // Yield to event loop
  
  await addAllToppings(pizza);
  
  await THE_FOUR_OVENS[0].bakeWithPromise(pizza);
  
  boxPizza(pizza); // Synchronous
  
  console.log(pizza.color(`[${currentSimTime()}] ✓ Done! ${pizza.pizzaKind} ready for ${pizza.customer}`));
}

// ============================================
// Demo
// ============================================

async function main() {
  printHeader("Pizza Restaurant - Async/Await Approach");
  
  const activePizzas: Promise<void>[] = [];
  
  // Poll for orders and start making pizzas
  while (hasOrdersRemaining()) {
    const order = checkPhone();
    if (order) {
      const pizza = createPizza(order);
      activePizzas.push(preparePizza(pizza));
    }
    await delay(0); // Yield to event loop
  }
  
  // Wait for all pizzas to finish
  await Promise.all(activePizzas);
  
  console.log(`\n[${currentSimTime()}] Done`);
}

main().catch(console.error);

export {};