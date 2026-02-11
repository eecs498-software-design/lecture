import * as readline from "node:readline/promises";

// ============================================
// Simplified Minesweeper with Inversion of Control
// ============================================

// The game emits events to observers rather than controlling flow itself
interface MinesweeperObserver {
  onCellRevealed(x: number, y: number, adjacentMines: number): void;
  onMineHit(x: number, y: number): void;
  onGameWon(): void;
}

type CellStatus = "hidden" | "revealed";
interface Cell {
  hasMine: boolean;
  status: CellStatus;
  adjacentMines: number;
}

class MinesweeperGame {
  private observers: MinesweeperObserver[] = [];

  private constructor(width: number, height: number, numMines: number) {
    // ... board initialization with mines, implementation not shown ...
  }

  public static create(width: number, height: number, numMines: number): MinesweeperGame {
    return new MinesweeperGame(width, height, numMines);
  }

  // Observer pattern - game notifies observers of events
  public addObserver(observer: MinesweeperObserver) {
    this.observers.push(observer);
  }

  // The game responds to commands but doesn't control when they happen
  public reveal(x: number, y: number): void {
    
    let cell!: Cell;
    let hasWon!: boolean;
    // ... 

    if (cell.hasMine) {
      this.observers.forEach(obs => obs.onMineHit(x, y));
    } else {
      this.observers.forEach(obs => obs.onCellRevealed(x, y, cell.adjacentMines));
      if ( hasWon ) {
        this.observers.forEach(obs => obs.onGameWon());
      }
    }
  }

  // ... other game methods (flag, etc.) not shown ...
}





// The "UI" directly controls and owns the game loop
class MinesweeperControllerNoIoC {
  public async run(game: MinesweeperGame, rl: readline.Interface): Promise<void> {
    // Game loop is INSIDE the game/controller
    while (true) {
      this.printBoard(game);
      const input = await rl.question("Enter move (x y): ");
      const [xStr, yStr] = input.split(" ");
      const x = Number(xStr), y = Number(yStr);
      
      game.reveal(x, y);
      // Check win/loss conditions here...
      // The controller owns the loop and decides when to stop
    }
  }

  private printBoard(game: MinesweeperGame): void {
    // Print the current state of the board
    // ... implementation not shown ...
    console.log("Current board:");
    console.log(game); // placeholder
  }
}

// The "UI" becomes passive and just reacts to game events
class GameControllerIOC {
  private gameOver = false;

  public constructor(private game: MinesweeperGame) {
    // Wire up game events to our handlers
    game.addObserver({
      onCellRevealed: (x, y, adj) => console.log(`Revealed (${x},${y}): ${adj} adjacent mines`),
      onMineHit: (x, y) => {
        console.log(`BOOM! Hit mine at (${x},${y}). Game Over.`);
        this.gameOver = true;
      },
      onGameWon: () => {
        console.log("You win!");
        this.gameOver = true;
      }
    });
  }

  public isGameOver(): boolean {
    return this.gameOver;
  }
}