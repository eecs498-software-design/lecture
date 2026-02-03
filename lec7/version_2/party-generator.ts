import { Randomizer } from "./randomization";
import { Person, Party } from "./restaurant";

/**
 * Represents distribution over random dining durations.
 */
export class RandomDurationDist {
  public readonly lowerBound: number;
  public readonly upperBound: number;

  constructor(lowerBound: number, upperBound: number) {
    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
  }

  public interpolate(randomizer: Randomizer): number {
    return this.lowerBound + randomizer.float() * (this.upperBound - this.lowerBound);
  }
}

interface PartyGeneratorConfig {
  arrivalRate: number;
  minPartySize: number;
  maxPartySize: number;
  minDiningTime: number;
  maxDiningTime: number;
};

const defaultConfig: PartyGeneratorConfig = {
  arrivalRate: 0.4,
  minPartySize: 1,
  maxPartySize: 6,
  minDiningTime: 30,
  maxDiningTime: 90
};

export class PartyGenerator {
  private randomizer: Randomizer;
  private config: PartyGeneratorConfig;
  private nextPatronId: number = 1;
  private readonly diningDist: RandomDurationDist;

  public constructor(randomizer: Randomizer, options: Partial<PartyGeneratorConfig> = {}) {
    this.randomizer = randomizer;
    this.config = { ...defaultConfig, ...options };
    this.diningDist = new RandomDurationDist(this.config.minDiningTime, this.config.maxDiningTime);
    
  }
  
  public getNextPatronId(): number {
    return this.nextPatronId++;
  }

  public generateParty(): Party | undefined {
    if (this.randomizer.float() < this.config.arrivalRate) {
      return this.makeParty();
    }
    return undefined;
  }

  public makeParty(): Party {
    const partySize = this.config.minPartySize + this.randomizer.range(this.config.maxPartySize - this.config.minPartySize + 1);
    const members: Person[] = [];

    for (let i = 0; i < partySize; i++) {
      const person = new Person(
        this.nextPatronId,
        `Guest ${this.nextPatronId}`,
        20 + this.randomizer.range(40)
      );
      members.push(person);
      this.nextPatronId++;
    }
    
    return new Party(members, this.diningDist.interpolate(this.randomizer));
  }
}
