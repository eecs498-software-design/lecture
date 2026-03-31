
import * as readline from "node:readline/promises";
import * as fs from "node:fs";

// A single menu item, where the text for the menu choice
// and the action performed are bundled together, eliminating
// the need for fragile semantic coupling elsewhere (i.e. a
// switch statement with cases for each title string).
interface MenuItem<Result> {
  title: string;
  action: () => Promise<Result>;
}

class Menu<Result = void> {
  private readonly prompt_message: string;
  private readonly items: readonly MenuItem<Result>[] = [];

  public constructor(prompt_message: string, items: MenuItem<Result>[]) {
    this.prompt_message = prompt_message;
    this.items = items;
  }

  // This function now prompts and also performs the action.
  // If we wanted, we could also return the item and let the caller
  // manually invoke item.action().
  public async prompt(rl: readline.Interface): Promise<Result> {
    const item = await this.prompt_item(rl);
    return item.action();
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
  // The code below implements option B (see the original file for option A).
  private async prompt_item(rl: readline.Interface) {
    while(true) {
      rl.write(this.prompt_message + "\n");
      this.items.forEach((item, index) => {
        rl.write(`${index + 1}. ${item.title}\n`);
      });
  
      const choice = await rl.question("Choose an option: ");
      const index = parseInt(choice, 10) - 1;
      const item = this.items[index];
      if (item) {
        return item;
      }
      // else invalid, continue loop to prompt again
    }
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
  const mainMenu = new Menu("Main Menu", [
    {
      title: "Run the catch phrase menu",
      action: async () => { await catch_phrases(rl); }
    },
    {
      title: "Print Hello World",
      action: async () => { rl.write("Hello World!\n"); rl.close(); }
    },
  ]);

  // No try/catch needed!
  mainMenu.prompt(rl);
}


async function catch_phrases(rl: readline.Interface) {

  // Show a menu of available catch phrase files
  const folder = "catch_phrases";
  const files = fs.readdirSync(folder).filter(f => f.endsWith(".txt"));

  const fileMenu = new Menu("Pick a catch phrase category:",
    files.map(file => ({
      title: file,
      action: async () => new CatchPhrases(`${folder}/${file}`)
    }))
  );

  const db = await fileMenu.prompt(rl);

  const characterMenu = new Menu("Pick a character:",
    db.characters().map(character => ({
      title: character,
      action: async () => {
        // We can feel confident about no try/catch here, since
        // the menu items are generated from the same list as the
        // valid characters in db.getCatchPhrase(), and this
        // correspondence is encapsulated in the construction of this
        // menu. If we ever do see an exception thrown here, there's
        // a bug that we should track down and fix.
        console.log(db.getCatchPhrase(character));
      }
    }))
  );
  characterMenu.prompt(rl);



}

main();