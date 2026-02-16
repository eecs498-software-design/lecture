import { assertNever } from "../../util/util";

// DOM types for these examples (normally provided by lib: ["dom"])
declare const document: { getElementById(id: string): HTMLElement | null };
declare interface HTMLElement { textContent: string | null; }

// ============================================
// PUB/SUB PATTERN - Car Example
// (With different types for each topic)
// ============================================

// Map each topic to its data type
type CarTopicData = {
  speed: number;
  engine_status: { rpm: number; running: boolean };
  fuel_level: number;
  door_status: "open" | "closed";
};

type CarTopic = keyof CarTopicData;

interface SubscriptionEvent<Topic_t extends CarTopic> {
  topic: Topic_t;
  data: CarTopicData[Topic_t];
}

interface Subscriber<Topic_t extends CarTopic> {
  onUpdate(event: SubscriptionEvent<Topic_t>): void;
}

class Broker {
  private topics: { [T in CarTopic]: Subscriber<T>[] } = {
    speed: [],
    engine_status: [],
    fuel_level: [],
    door_status: []
  };

  // The "Broker" manages the communication
  subscribe<T extends CarTopic>(topic: T, cb: Subscriber<T>) {
    (this.topics[topic] as Subscriber<T>[]).push(cb);
  }

  publish<T extends CarTopic>(topic: T, data: CarTopicData[T]) {
    (this.topics[topic] as Subscriber<T>[]).forEach(cb => cb.onUpdate({ topic, data }));
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
type DashboardTopics = "speed" | "fuel_level" | "door_status";
class DashboardSubscriber implements Subscriber<DashboardTopics> {
  private displayPanel: HTMLElement;
  // ... other UI elements ...

  public constructor(container: HTMLElement) {
    // ... create UI elements, implementation not shown ...
    this.displayPanel = container; // placeholder
  }

  // ... other Dashboard methods not shown ...

  onUpdate(event: SubscriptionEvent<DashboardTopics>) {
    if (event.topic === "speed") {
      this.displayPanel.textContent = `${event.data} mph`;
    } else if (event.topic === "fuel_level") {
      this.displayPanel.textContent = `Fuel: ${event.data}%`;
    } else if (event.topic === "door_status") {
      if (event.data === "open") {
        this.displayPanel.textContent = "Door Open!";
      }
    } else {
      assertNever(event.topic);
    }
  }
}

const dashboardContainer2 = document.getElementById("dashboard")!;
const dashboardSubscriber = new DashboardSubscriber(dashboardContainer2);
broker.subscribe("speed", dashboardSubscriber);
broker.subscribe("fuel_level", dashboardSubscriber);  // Also works - both are number

// Security system only cares about doors
const securitySubscriber: Subscriber<"door_status"> = {
  onUpdate: (event) => {
    console.log(`Security system: Door ${event.data}`);
  }
};
broker.subscribe("door_status", securitySubscriber);

// Engine monitor subscribes to engine status
const engineMonitor: Subscriber<"engine_status"> = {
  onUpdate: (event) => {
    console.log(`Engine: ${event.data.running ? "running" : "off"} at ${event.data.rpm} RPM`);
  }
};
broker.subscribe("engine_status", engineMonitor);

// Publish events - type-safe data for each topic
broker.publish("speed", 60);
broker.publish("door_status", "open");
broker.publish("engine_status", { rpm: 2500, running: true });
broker.publish("fuel_level", 75);




export {}; // Ensure this file is treated as a module