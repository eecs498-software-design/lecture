
import * as readline from "node:readline/promises";
import * as fs from "node:fs";
import { assert } from "node:console";

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

    // EAFP vs. LBYL??
    // LBYL is technically not safe here, since the file could be deleted
    // between the check and the read. This is an exogenous error, and EAFP
    // is the safest. However, for a low-stakes application (e.g. a simple
    // CLI tool), it is probably fine to LBYL. In other cases, e.g. making
    // a web request, we definitely can't rely on LBYL.
    if (fs.existsSync(filename)) { // look
      // what if someone deletes the file? This could still throw
      const text = fs.readFileSync(filename, "utf-8"); // leap
      this.parse_input(text);
    } else {
      console.log(`${filename} not found, using fallback phrases`);
    }
  }

  private parse_input(file_contents: string): void {
    // EAFP vs. LBYL??
    // LBYL is completely safe here, since we control the string.
    // If an exception is thrown, it's a preventable bug. In that case,
    // we should just fix it, not add a try/catch.
    for (const line of file_contents.split("\n")) {
      const sep = line.indexOf(": "); // look
      if (sep !== -1) {
        this.phrases.set(line.substring(0, sep), line.substring(sep + 2)); // leap (preventable)
      }
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