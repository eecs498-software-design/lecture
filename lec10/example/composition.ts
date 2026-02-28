interface ScoringStrategy {
  minLength(): number;
  calcPoints(word: string, currentPoints: number): number;
}
interface ThemeStrategy {
  getTooShortMsg(): string;
  getSuccessMsg(word: string): string;
}

const StandardScoring: ScoringStrategy = {
  minLength: () => 4,
  calcPoints: (word) => word.length,
};
const EasyScoring: ScoringStrategy = {
  minLength: () => 3,
  calcPoints: (word, currentPoints) => {
    // first word is always worth 10 points
    if (currentPoints === 0) { return 10; }
    else { return word.length + 2; }
  },
};

// Concrete theme strategies
class HalloweenTheme implements ThemeStrategy {
  private num_too_short = 0;
  getTooShortMsg() {
    this.num_too_short++;
    return "👻".repeat(this.num_too_short) + " Boo short!";
  }
  getSuccessMsg(word: string) { return `🎃 "${word}"`; }
}

const SportsTheme: ThemeStrategy = {
  getTooShortMsg() { return "⚽ Didn't make the cut!"; },
  getSuccessMsg(word: string) { return `🏆 "${word}"`; }
}




class SpellingBeeGame {
  private pts = 0;

  constructor(private scoring: ScoringStrategy,
              private theme: ThemeStrategy) {}

  public submitGuess(word: string): number {
    const tooShortMessage = this.theme.getTooShortMsg();
    if (word.length < this.scoring.minLength()) {
      console.log(tooShortMessage);
      return this.scoring.calcPoints(word, this.pts);
    }

    const pts = this.scoring.calcPoints(word, this.pts);
    this.pts += pts;
    console.log(this.theme.getSuccessMsg(word));
    console.log(`You earned ${pts}!`);
    return pts;
  }

  public getPoints(): number { return this.pts; }
}

const game1 = new SpellingBeeGame(StandardScoring,
                                  new HalloweenTheme());
const game2 = new SpellingBeeGame(EasyScoring,
                                  SportsTheme);
const game3 = new SpellingBeeGame(EasyScoring,
                                  new HalloweenTheme());

export {};