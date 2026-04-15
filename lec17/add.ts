import { setTimeout } from "node:timers/promises";
import colors from "colors";
import { assert } from "./util";

let current_choice_index = 0;

const COLOR_CHOICES = [
  colors.red, colors.green, colors.blue,
  colors.yellow, colors.magenta, colors.cyan,
];

const CAT_NAME_CHOICES = [
  "Whiskers", "Mittens", "Shadow", "Simba", "Oreo", "Tiger"
];

assert(COLOR_CHOICES.length === CAT_NAME_CHOICES.length);

/**
 * This is the regular, **blocking** version of the "add" function:
 * A function that simulates addition by "counting up", for example, to
 * add 3 + 5, it starts at 5 and then counts out loud one at a time:
 *   ...6
 *   ...7
 *   ...8
 * It prints to the terminal as it counts, and each count takes one second.
 */
export function addBlocking(x: number, y: number): number {
  const color = COLOR_CHOICES[current_choice_index++ % COLOR_CHOICES.length]!;
  console.log(color(`adding ${x} + ${y}...`));
  // number of seconds to block is smaller of x and y
  let result = Math.max(x, y);
  for(let nextPrint = Date.now() + 1000; result < x + y; nextPrint += 1000) {
    while (Date.now() < nextPrint) {
      // busy wait
    }
    result += 1;
    console.log(color(`...${result}`));
  }
  console.log(color(`${x} + ${y} = ${result} (blocking add complete)`));
  return result;
}

/**
 * This is the asynchronous, **non-blocking** version of the "add" function:
 * A function that simulates addition by delegating the work to a cat who
 * uses the "counting up" process, meowing after each count. For example, to
 * add 3 + 5, it starts at 5 and then counts out loud one at a time:
 *   ...6 meow
 *   ...7 meow
 *   ...8 meow
 * It prints to the terminal as it counts, and each count takes one second.
 * The cat's name is also printed to help keep track of them.
 */
export async function addNonBlocking(x: number, y: number): Promise<number> {
  // important, grab the start time before any awaits
  const start = Date.now();

  // wait a random amount of time up to 100ms before starting
  await setTimeout(Math.random() * 100);

  const color = COLOR_CHOICES[current_choice_index]!;
  const cat_name = CAT_NAME_CHOICES[current_choice_index]!;
  current_choice_index = (current_choice_index + 1) % COLOR_CHOICES.length;
  console.log(color(`${cat_name} is adding ${x} + ${y}...`));
  let result = Math.max(x, y);

  // time steps of 1 second
  const resultTimes: [number,number][] = [];
  for (let t = start + 1000; result < x + y; t += 1000) {
    resultTimes.push([t, result += 1]);
  }

  for(const [time, value] of resultTimes) {
    if (Date.now() < time) {
      await setTimeout(time - Date.now());
    }
    console.log(color(`${cat_name}: ...${value} meow`));
  }

  console.log(color(`${x} + ${y} = ${result} (non-blocking add complete)`));
  return result;
}