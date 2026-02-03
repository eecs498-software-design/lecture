import { Randomizer } from "./randomization";
import { PartyGenerator } from "./party-generator";
import { assert } from "node:console";


// The DiningTime class has been renamed to RandomDurationDist
// and moved to the party-generator.ts file.


/**
 * Represents a table at our restaurant and the party sitting there.
*/
export class Table {
  public readonly id: number;
  public readonly capacity: number;
  
  private current_party: Party | undefined;
  private current_party_starting_time: number | undefined;
  
  constructor(id: number, capacity: number) {
    this.id = id;
    this.capacity = capacity;
  }

  public getParty() {
    return this.current_party;
  }

  public isOccupied(): boolean {
    return this.current_party !== undefined;
  }

  public setParty(party: Party, startingTime: number) {
    if (this.current_party) {
      throw new Error("previous party still here");
    }
    if (party.members.length > this.capacity) {
      throw new Error("not enough room here");
    }
    this.current_party = party;
    this.current_party_starting_time = startingTime;
  }
  
  public isFinished(currentTime: number): boolean {
    if (!this.current_party || !this.current_party_starting_time) { return true; }
    return currentTime >= this.current_party_starting_time + this.current_party.diningDuration;
  }

  public clearTable(): void {
    this.current_party = undefined;
    this.current_party_starting_time = undefined;
  }

  public to_string(): string {
    if (!this.current_party) {
      return `[${" ".repeat(this.capacity)}]`;
    }
    else {
      return `[${"*".repeat(this.current_party.members.length).padEnd(this.capacity, " ")}]`;
    }
  }
}


/**
 * Represents a person dining at our restaurant and their current table.
 */
export class Person {
  public readonly id: number;
  public readonly name: string;
  public readonly age: number;

  constructor(id: number, name: string, age: number) {
    assert(age > 0);
    this.id = id;
    this.name = name;
    this.age = age;
  }

}



/**
 * Represents a party of people coming to the restaurant together.
 */
export class Party {
  public readonly members: readonly Person[];
  public readonly diningDuration: number;

  constructor(members: Person[], diningDuration: number) {
    this.members = members;
    this.diningDuration = diningDuration;
  }
}



/**
 * Represents the restaurant, its tables, and its waiting queue.
 * Manages the seating of new parties from the queue as tables are available.
 */
export class Restaurant {
  private tables: Table[]; // can have 1 assigned party
  private waitingQueue: Party[];
  private currentTime: number = 0;
  private totalServed: number = 0;

  constructor(tables: Table[]) {
    this.tables = tables;
    this.waitingQueue = [];
    this.currentTime = 0;
  }

  public addToWaitingQueue(party: Party): void {
    this.waitingQueue.push(party);
  }

  public getWaitingQueue(): Party[] {
    return this.waitingQueue;
  }

  public getWaitingPatronCount(): number {
    return this.waitingQueue.reduce((sum, party) => sum + party.members.length, 0);
  }

  public nextAvailableTable(): Table | undefined {
    return this.tables.find(table => !table.isOccupied());
  }

  public simulateStep(timeStep: number): void {
    this.currentTime += timeStep;

    // Check each table to see if patrons are done dining
    for (const table of this.tables) {
      // if there is a party and it's finished, clear
      if (table.isFinished(this.currentTime)) {
        table.clearTable();
      }
    }

    // Try to seat waiting parties
    while (this.waitingQueue.length > 0) {
      const nextParty = this.waitingQueue.shift()!; // ! assertion since we just checked length
      const table = this.nextAvailableTable(); // UPDATE THIS ALGORITHM
      if (!table) {
        break; // No more available tables
      }

      try {
        table.setParty(nextParty, this.currentTime); // throws if we can't seat them
        this.totalServed += nextParty.members.length;
      }
      catch (e) {
        // If we can't seat them, put them back in the queue
        this.waitingQueue.unshift(nextParty);
        break;
      }
    }

  }

  public runSimulation(duration: number, timeStep: number): void {
    while (this.currentTime < duration) {
      this.simulateStep(timeStep);
    }
  }

  public printReport(): void {
    // print tables, total served, and queue length on one line
    const table_str = this.tables.map((table, i) => `${i+1}: ${table.to_string()}`).join(" ");
    console.log(`${this.currentTime} | Tables: ${table_str} | Served: ${this.totalServed}, Queue: ${this.getWaitingPatronCount()}`);
  }

}



function main(): void {
  // Create a randomizer for the simulation
  const randomizer = Randomizer.create_from_seed("restaurant-sim");

  // Create tables with different capacities
  const tables = [
    new Table(1, 2),  // Table for 2
    new Table(2, 2),  // Table for 2
    new Table(3, 4),  // Table for 4
    new Table(4, 4),  // Table for 4
    new Table(5, 6),  // Table for 6
  ];

  // Create the restaurant
  const restaurant = new Restaurant(tables);

  console.log("=== Restaurant Simulation ===");
  console.log(`Tables: ${tables.length}`);
  console.log("");

  // Simulation parameters
  const duration = 240; // 4 hours until closing
  const timeStep = 5;

  const partyGenerator = new PartyGenerator(randomizer, {
    arrivalRate: 0.4,
    minPartySize: 1,
    maxPartySize: 6,
    minDiningTime: 30,
    maxDiningTime: 90
  });

  let partyCount = 0;

  for (let time = 0; time <= duration; time += timeStep) {
    // Generate new parties randomly throughout the simulation
    const newParty = partyGenerator.generateParty();
    if (newParty) {
      restaurant.addToWaitingQueue(newParty);
      partyCount++;
    }

    restaurant.simulateStep(timeStep);

    restaurant.printReport();
  }

}

main();
