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





export {}; // Ensure this file is treated as a module