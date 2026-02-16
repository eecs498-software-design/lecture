// DOM types for these examples (normally provided by lib: ["dom"])
declare const document: { getElementById(id: string): HTMLElement | null };
declare interface HTMLElement { textContent: string | null; }

// ============================================
// PUB/SUB PATTERN - Car Example
// ============================================

type CarTopic = "speed" | "engine_status" | "fuel_level" | "door_status";

interface Subscriber {
  onUpdate(topic: string, data: string): void;
}

class Broker {
  private topics: { [key in CarTopic]: Subscriber[] } = {
    speed: [],
    engine_status: [],
    fuel_level: [],
    door_status: []
  };

  // The "Broker" manages the communication
  subscribe(topic: CarTopic, cb: Subscriber) {
    this.topics[topic].push(cb);
  }

  publish(topic: CarTopic, data: string) {
    this.topics[topic].forEach(cb => cb.onUpdate(topic, data));
  }
}

// The Car publishes to the broker - it doesn't know about subscribers
class Car {
  public constructor(private broker: Broker) { }

  // ... other Car methods not shown ...

  public setSpeed(speed: number) {
    // ... update internal state ...
    this.broker.publish("speed", `${speed} mph`);
  }
}

// Usage Example
const broker = new Broker();
const car = new Car(broker);

// Dashboard subscribes to speed and fuel
class DashboardSubscriber implements Subscriber {
  private displayPanel: HTMLElement;
  // ... other UI elements ...

  public constructor(container: HTMLElement) {
    // ... create UI elements, implementation not shown ...
    this.displayPanel = container; // placeholder
  }

  // ... other Dashboard methods not shown ...

  onUpdate(data: string) {
    this.displayPanel.textContent = data;
  }
}

const dashboardContainer2 = document.getElementById("dashboard")!;
const dashboardSubscriber = new DashboardSubscriber(dashboardContainer2);
broker.subscribe("speed", dashboardSubscriber);
broker.subscribe("fuel_level", dashboardSubscriber);

// Security system only cares about doors
const securitySubscriber: Subscriber = {
  onUpdate: (data) => console.log(`Security system: ${data}`)
};
broker.subscribe("door_status", securitySubscriber);

// Engine monitor subscribes to engine status
const engineMonitor: Subscriber = {
  onUpdate: (data) => console.log(`Engine monitor: ${data}`)
};
broker.subscribe("engine_status", engineMonitor);

// Publish events - only relevant subscribers receive them
broker.publish("speed", "60 mph");
broker.publish("door_status", "Driver door opened");
broker.publish("engine_status", "Engine running at 2500 RPM");
broker.publish("fuel_level", "75% remaining");





export {}; // Ensure this file is treated as a module