
// Summary:
// This version intentionally uses a shallower menu abstraction: prompt once,
// throw on invalid input, and let callers recover with try/catch.
// It is useful for discussing vexing exceptions, semantic coupling between
// menu labels and control flow, and where EAFP/LBYL tradeoffs appear.

import * as readline from "node:readline/promises";
import * as fs from "node:fs";

class Menu {
  private items: string[] = [];

  addItem(item: string): void {
    this.items.push(item);
  }

  // Consider two abstractions:
  //  A. Prompt once, but throw if the user gives an invalid response
  //  B. Keep prompting until the user gives a valid response
  //
  // A has more expressive power, since it allows the caller to decide
  // how to handle invalid input. B is deeper, since it handles re-prompting
  // for us. In this case, B is almost certainly the better choice, since
  // there aren't realistic cases where the caller actually wants to handle
  // invalid input differently. Option B is arguably less complex and obscure as well.
  //
  // The code below implements option A (see the improved file for option B).
  async prompt(rl: readline.Interface) {
    rl.write("Menu:\n");
    this.items.forEach((item, index) => {
      rl.write(`${index + 1}. ${item}\n`);
    });

    const choice = await rl.question("Choose an option: ");
    const index = parseInt(choice, 10) - 1;
    if (isNaN(index) || index < 0 || index >= this.items.length) {
      throw new Error("Invalid menu choice"); // This is a "vexing" exception
    }
    return this.items[index]!;
  }

}


class CatchPhrases {
  private phrases: Map<string, string>;

  constructor(filename: string) {
    this.phrases = new Map<string, string>();

    // [EAFP vs. LBYL?] Attempt to read a file that might be missing.
    //
    // LBYL is technically not safe here, since the file could be deleted
    // between the check and the read. This is an exogenous error, and EAFP
    // is the only way to ensure an error is handled gracefully.
    // 
    // However, for a low-stakes application (e.g. a simple CLI tool) and
    // where it is unlikely for the file to go missing in between the two
    // calls, it's common to see LYBL in the wild. The worse case is that the
    // subsequent fs.readFileSync() throws with an ultimately uncaught exception.
    // 
    // In other cases, e.g. making a web request, it ins't clear how we would
    // even try to LYBL (i.e. send a first request to ask if a subsequent
    // request would succeed??), or we may just choose to prioritize complete
    // safety and use EAFP.
    //
    // The example below shows LBYL. (See the improved file for an EAFP version.)
    if (fs.existsSync(filename)) { // "look" first
      // what if someone deletes the file? This could still throw
      const text = fs.readFileSync(filename, "utf-8"); // "then" leap
      this.parse_input(text);
    } else {
      console.log(`${filename} not found, using fallback phrases`);
    }
  }

  private parse_input(file_contents: string): void {
    // [EAFP vs. LBYL?] Extract substrings before/after ": " from a
    // potentially malformed string.
    //
    // First, the call to line.indexOf() is technically an EAFP.
    // We don't need to check if the separator exists, we just plan to
    // respond to the -1 "error" result (returned via "errors as values"
    // rather than a thrown exception) by ignoring malformed lines.
    //
    // Checking for -1 then becomes the "look" part of the substring code.
    // LBYL is completely safe here, since we can inspect the string.
    // If an exception were to be thrown, it's a preventable bug.
    // In that case, we should just fix it, not add a try/catch.
    //
    // Finally, note that in JavaScript, .substring() never throws
    // exceptions - it just ignores out-of-bounds parts of the given
    // range. Is this "safe", such that we don't need to LBYL? Nope!
    // For example, assume we have the malformed line "Batman, I'm Batman"
    // There is no ": ", so line.indexOf(": ") returns -1, meaning sep = -1.
    // Then, we have:
    //   this.phrases.set(line.substring(0, sep), line.substring(sep + 2));
    //                         ^        (0, -1 )       ^        (-1 + 2 ) 
    //                         |                       |                  
    //                      returns ""              returns "atman, I'm Batman"
    // And now a random entry with a key of "" and a value of "atman, I'm Batman"
    // is added to our catch phrases. That could certainly cause problems.
    //
    // There's an insidious issue here if we had tried to use EAFP. We could
    // have even wrapped the code up in a try/catch that makes it appear like
    // we are ignoring invalid entries, but if .substring() never actually throws
    // to report a problem to us, we don't get the chance to "ask forgiveness".
    // So, we also need to be mindful of "will this actually check what I give it?".
    for (const line of file_contents.split("\n")) {
      const sep = line.indexOf(": "); // EAFP, but must check for -1 later
      if (sep !== -1) { // look "first"
        this.phrases.set(line.substring(0, sep), line.substring(sep + 2)); // then leap
      }
      // Otherwise ignore the line

      // This EAFP approach would be insidiously broken! (see comments above)
      // try {
      //   const sep = line.indexOf(": ");
      //   this.phrases.set(line.substring(0, sep), line.substring(sep + 2));
      // } catch {
      //   // ignore malformed lines
      // }
    }
  }

  characters(): string[] {
    return [...this.phrases.keys()];
  }

  getCatchPhrase(character: string) {
    if (!this.phrases.has(character)) {
      throw new Error(`Unknown character: ${character}`);
    }
    return this.phrases.get(character)!;
  }
}


async function main() {

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // menu asking if they want to run or just print hello world
  const mainMenu = new Menu();
  mainMenu.addItem("Run the catch phrase menu");
  mainMenu.addItem("Print Hello World");

  while(true) {
    try {
      const choice = await mainMenu.prompt(rl);
      switch (choice) {
        case "Run the catch phrase menu":
          await catch_phrases(rl);
          break;
        case "Print Hello World":
          rl.write("Hello World!\n");
          rl.close();
          return;
        default:
          // The code should never actually run, since the prompt function
          // throws on invalid choices. However, we could have mistyped an
          // option in the switch cases, and the semantic coupling between
          // those and the original prompts is fragile.
          throw new Error("Something went wrong!");
      }
    }
    catch(e) {
      // This try catch is needed due to the "vexing" exception thrown by
      // the prompt function (i.e. it doesn't handle reprompting itself).
      rl.write("Invalid selection!\n");
    }
  }
}


async function catch_phrases(rl: readline.Interface) {

  // Show a menu of available catch phrase files
  const folder = "catch_phrases";
  const files = fs.readdirSync(folder).filter(f => f.endsWith(".txt"));

  const fileMenu = new Menu();
  for (const file of files) {
    fileMenu.addItem(file);
  }

  rl.write("Pick a catch phrase category:\n");
  const chosenFile = await fileMenu.prompt(rl);

  const db = new CatchPhrases(`${folder}/${chosenFile}`);

  const characterMenu = new Menu();
  for (const character of db.characters()) {
    characterMenu.addItem(character);
  }

  while(true) {
    const character = await characterMenu.prompt(rl);
    try {
      const phrase = db.getCatchPhrase(character);
      rl.write(phrase + "\n");
    } catch (e) {
      rl.write("Unknown character!\n");
    }
  }
  
}

main();