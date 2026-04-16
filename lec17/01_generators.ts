/**
 * Generators as Coroutines - Pizza Restaurant Example
 * 
 * Generators provide a way to pause and resume execution, which can be
 * used to model cooperative multitasking (coroutines). Each "yield" is
 * a suspension point where control returns to the scheduler.
 * 
 * ERROR HANDLING: Exceptions propagate out of generator.next() and can
 * be caught by the scheduler and added to retryQueue.
 * 
 * This demonstrates two kinds of work:
 * - CPU-bound (prep, toppings, boxing): Busy-wait, blocks the cook
 * - I/O-bound (baking): Start oven, poll for completion, yields to other tasks
 */

import { findAvailableOven, Oven } from "./oven";
import { checkPhone, hasOrdersRemaining } from "./phone";
import { addTopping, boxPizza, createPizza, Pizza, prepareDough } from "./pizza";
import { currentSimTime, printHeader } from "./util";

type Coroutine = Generator<unknown, void, void>;

function* addAllToppings(pizza: Pizza): Coroutine {
  for (const topping of pizza.toppings) {
    addTopping(pizza, topping);
    yield; // Yield after each topping
  }
}

function* bakeWithPolling(pizza: Pizza): Coroutine {
  let oven: Oven | undefined;
  while (!(oven = findAvailableOven())) {
    yield; // No oven available, yield and try again
  }
  
  oven.startBaking(pizza);
  while (!oven.checkIfDone()) {
    yield; // Yield frequently while waiting
  }
  // Note: If oven.checkIfDone() threw, it would propagate here
  // and the scheduler would catch it via generator.throw()
}

function* preparePizza(pizza: Pizza): Coroutine {
  console.log(pizza.color(`[${currentSimTime()}] Starting: ${pizza.pizzaKind} for ${pizza.customer}`));  

  prepareDough(pizza);
  yield;

  yield* addAllToppings(pizza);
  yield* bakeWithPolling(pizza);

  boxPizza(pizza);
  
  console.log(pizza.color(`[${currentSimTime()}] ✓ Done! ${pizza.pizzaKind} ready for ${pizza.customer}`));
}

/**
 * Scheduler that runs coroutines cooperatively.
 * Checks phone at each yield point!
 */
// Track which pizzas need retry
const retryQueue: Pizza[] = [];

function runScheduler() {
  const task_queue: Array<{ coroutine: Coroutine; pizza: Pizza }> = [];

  while (task_queue.length > 0 || hasOrdersRemaining() || retryQueue.length > 0) {
    // Check phone directly each iteration
    const order = checkPhone();
    if (order) {
      const pizza = createPizza(order);
      task_queue.push({ coroutine: preparePizza(pizza), pizza });
    }
    
    // Process retries
    while (retryQueue.length > 0) {
      const pizza = retryQueue.shift()!;
      console.log(pizza.color(`[${currentSimTime()}] ⚠ Retrying ${pizza.pizzaKind} for ${pizza.customer}...`));
      task_queue.push({ coroutine: preparePizza(pizza), pizza });
    }
    
    // Run one step of one task
    const nextTask = task_queue.shift();
    if (nextTask) {
      try {
        const result = nextTask.coroutine.next();
        if (!result.done) {
          task_queue.push(nextTask); // Not finished, put it back in the queue
        }
      } catch (e) {
        // Bake failed - queue for retry
        console.log(nextTask.pizza.color(`[${currentSimTime()}] ⚠ Bake failed for ${nextTask.pizza.customer}!`));
        retryQueue.push(nextTask.pizza);
      }
    }
  }
  
  console.log(`\n[${currentSimTime()}] Done`);
}

// ============================================
// Demo
// ============================================

function main() {
  printHeader("Pizza Restaurant - Generator/Coroutine Approach (Error Handling)");
  runScheduler();
}

main();

export {};