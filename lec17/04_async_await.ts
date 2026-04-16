/**
 * Async/Await - Pizza Restaurant Example
 * 
 * Async/await is syntactic sugar over Promises that makes asynchronous
 * code look and feel like synchronous code. This is the modern approach
 * and what you should use in most cases.
 * 
 * ERROR HANDLING: Use try/catch just like synchronous code!
 * This is the cleanest syntax - looks exactly like sync error handling.
 * 
 * Note: Individual prep steps are still synchronous.
 * But we use await between steps to yield to the event loop.
 */

import { requestOvenWithPromise } from "./oven";
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

async function preparePizza(pizza: Pizza): Promise<void> { // may throw
  console.log(pizza.color(`[${currentSimTime()}] Starting: ${pizza.pizzaKind} for ${pizza.customer}`));
  
  prepareDough(pizza); // Synchronous
  await delay(0);      // Yield to event loop
  
  await addAllToppings(pizza);
  
  const oven = await requestOvenWithPromise();  // Wait for an available oven
  await oven.bakeWithPromise(pizza); // might throw
  
  boxPizza(pizza); // Synchronous
  
  console.log(pizza.color(`[${currentSimTime()}] ✓ Done! ${pizza.pizzaKind} ready for ${pizza.customer}`));
}

// ============================================
// Demo
// ============================================

// Retry helper using try/catch - cleanest syntax!
async function makePizzaWithRetry(pizza: Pizza): Promise<void> {
  while (true) {
    try {
      await preparePizza(pizza);
      return; // Success!
    } catch (err) {
      console.log(pizza.color(`[${currentSimTime()}] ⚠ Bake failed for ${pizza.customer}, retrying...`));
      // Loop will retry
    }
  }
}

async function main() {
  printHeader("Pizza Restaurant - Async/Await Approach (Error Handling)");
  
  const activePizzas: Promise<void>[] = [];
  
  // Poll for orders and start making pizzas
  while (hasOrdersRemaining()) {
    const order = checkPhone();
    if (order) {
      const pizza = createPizza(order);
      activePizzas.push(makePizzaWithRetry(pizza));
    }
    await delay(0); // Yield to event loop
  }
  
  // Wait for all pizzas to finish
  await Promise.all(activePizzas);
  
  console.log(`\n[${currentSimTime()}] Done`);
}

main().catch(console.error);

export {};