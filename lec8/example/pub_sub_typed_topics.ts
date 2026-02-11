// DOM types for these examples (normally provided by lib: ["dom"])
declare const document: { getElementById(id: string): HTMLElement | null };
declare interface HTMLElement { textContent: string | null; }

// ============================================
// OBSERVER PATTERN - Car Example
// ============================================

interface CarObserver {
  onSpeedUpdate(speed: number): void;
  onStopped(): void;
}

class Car {
  private observers: CarObserver[] = [];
  private speed: number = 0;

  // The Car (Subject) maintains a list of observers
  public addObserver(observer: CarObserver) {
    this.observers.push(observer);
  }

  public setSpeed(newSpeed: number) {
    const wasStopped = this.speed === 0;
    this.speed = newSpeed;
    
    // Notify all observers of the speed change
    this.observers.forEach(obs => obs.onSpeedUpdate(newSpeed));
    
    // If the car just came to a stop, notify observers
    if (newSpeed === 0 && !wasStopped) {
      this.observers.forEach(obs => obs.onStopped());
    }
  }

  public getSpeed() {
    return this.speed;
  }
}

// Usage Example
const car = new Car();

class Dashboard implements CarObserver {
  private speedGauge: HTMLElement;
  private statusIndicator: HTMLElement;
  // ... other UI elements ...

  public constructor(container: HTMLElement) {
    // ... create UI elements, implementation not shown ...
    this.speedGauge = container; // placeholder
    this.statusIndicator = container; // placeholder
  }

  // ... other Dashboard methods not shown ...

  onSpeedUpdate(speed: number) {
    this.speedGauge.textContent = `${speed} mph`;
  }

  onStopped() {
    this.statusIndicator.textContent = "STOPPED";
  }
}

const dashboardContainer = document.getElementById("dashboard")!;
const dashboard = new Dashboard(dashboardContainer);

const safetySystem: CarObserver = {
  onSpeedUpdate: (speed) => {
    if (speed > 80) console.log(`Safety: Warning! Speed exceeds 80 mph`);
  },
  onStopped: () => {} // No action needed on stop for safety system
};

car.addObserver(dashboard);
car.addObserver(safetySystem);

car.setSpeed(60);  // Dashboard shows speed, safety system quiet
car.setSpeed(90);  // Dashboard shows speed, safety system warns
car.setSpeed(0);   // Both observers notified of stop







// ============================================
// PUB/SUB PATTERN - Car Example
// ============================================

// Map each topic to its data type
type CarTopicData = {
  speed: number;
  engine_status: { rpm: number; running: boolean };
  fuel_level: number;
  door_status: "open" | "closed";
};

type CarTopic = keyof CarTopicData;

interface Subscriber<T> {
  onUpdate(data: T): void;
}

class Broker {
  private topics: { [K in CarTopic]: Subscriber<CarTopicData[K]>[] } = {
    speed: [],
    engine_status: [],
    fuel_level: [],
    door_status: []
  };

  // The "Broker" manages the communication
  subscribe<T extends CarTopic>(topic: T, cb: Subscriber<CarTopicData[T]>) {
    (this.topics[topic] as Subscriber<CarTopicData[T]>[]).push(cb);
  }

  publish<T extends CarTopic>(topic: T, data: CarTopicData[T]) {
    (this.topics[topic] as Subscriber<CarTopicData[T]>[]).forEach(cb => cb.onUpdate(data));
  }
}

// The Car publishes to the broker - it doesn't know about subscribers
class Car2 {
  public constructor(private broker: Broker) { }

  // ... other Car methods not shown ...

  public setSpeed(speed: number) {
    // ... update internal state ...
    this.broker.publish("speed", speed);  // Type-safe: must be a number
  }
}

// Usage Example
const broker = new Broker();
const car2 = new Car2(broker);

// Dashboard subscribes to speed and fuel
class DashboardSubscriber implements Subscriber<number> {
  private displayPanel: HTMLElement;
  // ... other UI elements ...

  public constructor(container: HTMLElement) {
    // ... create UI elements, implementation not shown ...
    this.displayPanel = container; // placeholder
  }

  // ... other Dashboard methods not shown ...

  onUpdate(data: number) {
    this.displayPanel.textContent = `${data} mph`;
  }
}

const dashboardContainer2 = document.getElementById("dashboard")!;
const dashboardSubscriber = new DashboardSubscriber(dashboardContainer2);
broker.subscribe("speed", dashboardSubscriber);
broker.subscribe("fuel_level", dashboardSubscriber);  // Also works - both are number

// Security system only cares about doors
const securitySubscriber: Subscriber<"open" | "closed"> = {
  onUpdate: (data) => console.log(`Security system: Door ${data}`)
};
broker.subscribe("door_status", securitySubscriber);

// Engine monitor subscribes to engine status
const engineMonitor: Subscriber<{ rpm: number; running: boolean }> = {
  onUpdate: (data) => console.log(`Engine: ${data.running ? "running" : "off"} at ${data.rpm} RPM`)
};
broker.subscribe("engine_status", engineMonitor);

// Publish events - type-safe data for each topic
broker.publish("speed", 60);
broker.publish("door_status", "open");
broker.publish("engine_status", { rpm: 2500, running: true });
broker.publish("fuel_level", 75);




export {}; // Ensure this file is treated as a module