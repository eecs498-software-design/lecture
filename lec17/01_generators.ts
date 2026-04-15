/**
 * Generators as Coroutines - Pizza Restaurant Example
 * 
 * Generators provide a way to pause and resume execution, which can be
 * used to model cooperative multitasking (coroutines). Each "yield" is
 * a suspension point where control returns to the scheduler.
 * 
 * This demonstrates two kinds of work:
 * - CPU-bound (prep, toppings, boxing): Busy-wait, blocks the cook
 * - I/O-bound (baking): Start oven, poll for completion, yields to other tasks
 * 
 * THE PHONE PROBLEM: We can only answer at yield points!
 * During CPU-bound work, we're blocked and calls time out.
 * During I/O polling, we yield frequently and can answer.
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
function runScheduler() {
  const task_queue: Coroutine[] = [];

  while (task_queue.length > 0 || hasOrdersRemaining()) {
    // Check phone directly each iteration
    const order = checkPhone();
    if (order) {
      task_queue.push(preparePizza(createPizza(order)));
    }
    
    // Run one step of one task
    const nextTask = task_queue.shift();
    if (nextTask) {
      const result = nextTask.next();
      if (!result.done) {
        task_queue.push(nextTask); // Not finished, put it back in the queue
      }
    }
  }
  
  console.log(`\n[${currentSimTime()}] Done`);
}

// ============================================
// Demo
// ============================================

function main() {
  printHeader("Pizza Restaurant - Generator/Coroutine Approach");
  runScheduler();
}

main();

export {};