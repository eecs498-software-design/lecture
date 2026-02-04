import { Randomizer } from "./randomization";
import { PartyGenerator } from "./party-generator";
import { assert } from "../util/util";



// The DiningTime class has been renamed to RandomDurationDist
// and moved to the party-generator.ts file.


/**
 * Represents a table at our restaurant. We no longer track
 * patrons at the table here. It's just a table now.
*/
export class Table {
  public readonly id: number;
  public readonly capacity: number;
  
  constructor(id: number, capacity: number) {
    this.id = id;
    this.capacity = capacity;
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



export interface TableAssignment {
  readonly table: Table;
  readonly party: Party;
  readonly startingTime: number;
  readonly endingTime: number;
}

/**
 * Represents the tables in a restaurant and which parties
 * are sitting at them.
 */
class RestaurantSeating {
  private n_available_tables: number;
  private table_assns: { readonly table: Table, assignment: TableAssignment | undefined }[] = [];
  
  constructor(tables: Table[]) {
    // All tables initially unassigned
    this.table_assns = tables.map(t => ({ table: t, assignment: undefined }));
    this.n_available_tables = tables.length;
  }

  public getTableAssignments(): { table: Table, assignment: TableAssignment | undefined }[] {
    return this.table_assns;
  }

  public assignIfPossible(party: Party, startTime: number): TableAssignment | undefined {
    
    const suitable_table = this.table_assns.find(ta => !ta.assignment && ta.table.capacity >= party.members.length);
    if (!suitable_table) {
      return undefined;
    }

    --this.n_available_tables;
    suitable_table.assignment = { table: suitable_table.table, party: party, startingTime: startTime, endingTime: startTime + party.diningDuration };
    return suitable_table.assignment;

  }

  public clearFinished(currentTime: number): void {
    for (const ta of this.table_assns) {
      if (ta.assignment && ta.assignment.endingTime <= currentTime) {
        ta.assignment = undefined;
        ++this.n_available_tables;
      }
    }
  }

  public hasAvailableTables(): number {
    return this.n_available_tables;
  }

  public tables_string(): string {
    return this.table_assns.map((ta, i) => `${i+1}: ${table_to_string(ta.table, ta.assignment?.party)}`).join(" ");
  }
}

function table_to_string(table: Table, party: Party | undefined): string {
  // return a string with width equal to capacity showing * for each patron
  if (!party) {
    return `[${" ".repeat(table.capacity)}]`;
  }
  else {
    return `[${"*".repeat(party.members.length).padEnd(table.capacity, " ")}]`;
  }
}



/**
 * Represents the restaurant, its tables, and its waiting queue.
 * Manages the seating of new parties from the queue as tables are available.
 */
export class Restaurant {
  private seating: RestaurantSeating;
  private waitingQueue: Party[];
  private currentTime: number = 0;
  private totalServed: number = 0;

  constructor(tables: Table[]) {
    this.seating = new RestaurantSeating(tables);
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

  public getTableAssignments(): { table: Table, assignment: TableAssignment | undefined }[] {
    return this.seating.getTableAssignments();
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getTotalServed(): number {
    return this.totalServed;
  }

  public simulateStep(timeStep: number): void {
    this.currentTime += timeStep;

    // Check each table to see if patrons are done dining
    this.seating.clearFinished(this.currentTime);

    // Try to seat waiting parties
    const not_seated = [];
    
    for(const party of this.waitingQueue) {
      const assignment = this.seating.assignIfPossible(party, this.currentTime);
      if (assignment) {
        this.totalServed += party.members.length;
      } else {
        not_seated.push(party);
      }
    }
    
    this.waitingQueue = not_seated;
  }

  public runSimulation(duration: number, timeStep: number): void {
    while (this.currentTime < duration) {
      this.simulateStep(timeStep);
    }
  }

  public printReport(): void {
    // print tables, total served, and queue length on one line
    console.log(`${this.currentTime} | Tables: ${this.seating.tables_string()} | Served: ${this.totalServed}, Queue: ${this.getWaitingPatronCount()}`);
  }

}