abstract class SpellingBeeGame {
  protected pts = 0;
  
  public submitGuess(word: string): number {
    if (word.length < this.minLength()) {
      console.log(this.getTooShortMsg());
      return 0;
    }
    const pts = this.calcPoints(word);
    this.pts += pts;
    console.log(this.getSuccessMsg(word));
    console.log(`You earned ${pts}!`);
    return pts;
  }

  public getPoints(): number { return this.pts; }
  
  protected abstract minLength(): number;
  protected calcPoints(word: string): number {
    return word.length;  // default points = word length
  }
  protected getTooShortMsg(): string {
    return "Too short!";
  }
  protected getSuccessMsg(word: string): string {
    return `${this.calcPoints(word)} points!`;
  }
}


class HalloweenBee extends SpellingBeeGame {
  private num_too_short = 0;

  override minLength(): number { return 4; }
  override getTooShortMsg() {
    this.num_too_short++;
    return "👻".repeat(this.num_too_short) + " Boo short!"; 
  }

  override  getSuccessMsg(word: string) { return `🎃 "${word}"`; }
}

class SportsBee extends SpellingBeeGame {
  override minLength(): number { return 4; }
  override getTooShortMsg() {return "⚽ Didn't make the cut!"; }
  override getSuccessMsg(word: string) { return `🏆 "${word}"`; }
}

class EasyBee extends SpellingBeeGame {
  override minLength() { return 3; }
  override calcPoints(word: string) {
    // first word is always worth 10 points
    if (this.pts === 0) { return 10; }
    else { return word.length + 2; } // bonus!
  }
}



// Fragile Base Class Problem:
// Slight changes in the base class implementation end
// up breaking some derived classes.
abstract class SpellingBeeGame_Base_v2 {
  protected pts = 0;
  
  public submitGuess(word: string): number {
    const tooShortMessage = this.getTooShortMsg(); // Change 1: call this outside the length check, breaks HalloweenBee
    if (word.length < this.minLength()) {
      console.log(tooShortMessage);
      return this.calcPoints(word);
    }
    this.pts += this.calcPoints(word); // Change 2: call calculate points several times, breaks EasyBee
    console.log(this.getSuccessMsg(word) + ` (${this.calcPoints(word)} points)`);
    console.log(`You earned ${this.calcPoints(word)}!`);
    return this.calcPoints(word);
  }

  public getPoints(): number { return this.pts; }
  
  protected abstract minLength(): number;
  protected calcPoints(word: string): number {
    return word.length;  // default points = word length
  }
  protected getTooShortMsg(): string {
    return "Too short!";
  }
  protected getSuccessMsg(word: string): string {
    return `${this.calcPoints(word)} points!`;
  }
}

export {};
