import { PartyGenerator } from './restaurant/party-generator';
import { Randomizer } from './restaurant/randomization';
import { Restaurant, Table } from './restaurant/restaurant';
import { sleepBlocking } from './sleep';
import './style.css';

class RestaurantGUI {
  private restaurant: Restaurant;
  private tables: Map<number, HTMLElement> = new Map();
  private queueSection: HTMLElement;
  private timeDisplay: HTMLElement;

  constructor(restaurant: Restaurant, appElement: HTMLElement) {
    this.restaurant = restaurant;
    
    // Create initial HTML structure
    appElement.innerHTML = this.createAppHtml();
    
    // Store references to table elements
    const tableAssignments = this.restaurant.getTableAssignments();
    tableAssignments.forEach(ta => {
      const tableEl = document.querySelector<HTMLElement>(`.table[data-table-id="${ta.table.id}"]`);
      if (tableEl) {
        this.tables.set(ta.table.id, tableEl);
      }
    });
    
    // Store reference to queue section
    this.queueSection = document.querySelector<HTMLElement>('.queue-section')!;
    this.timeDisplay = document.querySelector<HTMLElement>('.current-time')!;
    
    // Set up event listeners
    // this.setupEventListeners();
  }

  private createTableHtml(table: Table): string {
    return `
      <div class="table" data-table-id="${table.id}">
        <div class="table-label">Table ${table.id}</div>
        <div class="table-seats">
          ${`<div class="seat"></div>`.repeat(table.capacity)}
        </div>
        <div class="table-capacity">Empty</div>
      </div>
    `;
  }

  private createAppHtml(): string {
    const tableAssignments = this.restaurant.getTableAssignments();
    const tablesHtml = tableAssignments.map(ta => this.createTableHtml(ta.table)).join('');
    
    const partyButtonsHtml = [1, 2, 3, 4, 5, 6].map(size => `
      <button class="add-party-btn" data-size="${size}">Party of ${size}</button>
    `).join('');
    
    return `
      <h1>🍽️ Restaurant</h1>
      <div class="current-time">⏰ Time: 0 min</div>
      
      <section class="tables-section">
        <h2>Tables</h2>
        <div class="tables-container">${tablesHtml}</div>
      </section>
      
      <section class="queue-section">
        <h2>Waiting Queue</h2>
        <div class="queue-info">
          <span>Parties waiting: <strong>0</strong></span>
          <span>People waiting: <strong>0</strong></span>
          <span>Total served: <strong>0</strong></span>
        </div>
        <div class="queue-list"><div class="empty-queue">No one waiting</div></div>
      </section>
      
      `;
      // <section class="controls-section">
      //   <h2>Add Party to Queue</h2>
      //   <div class="party-buttons">${partyButtonsHtml}</div>
      // </section>
  }

  // private setupEventListeners(): void {
  //   document.querySelectorAll('.add-party-btn').forEach(btn => {
  //     btn.addEventListener('click', (e) => {
  //       const size = parseInt((e.target as HTMLElement).dataset.size!);
  //       this.addParty(size);
  //     });
  //   });
  // }

  public updateTable(tableId: number): void {
    const tableEl = this.tables.get(tableId);
    if (!tableEl) return;

    const tableAssignment = this.restaurant.getTableAssignments().find(ta => ta.table.id === tableId);
    if (!tableAssignment) return;

    const { table, assignment } = tableAssignment;
    const currentTime = this.restaurant.getCurrentTime();
    const occupiedCount = assignment?.party.members.length ?? 0;
    const timeLeft = assignment ? Math.max(0, Math.ceil(assignment.endingTime - currentTime)) : 0;

    // Update occupied class
    tableEl.classList.toggle('occupied', !!assignment);

    // Update seats
    const seatsContainer = tableEl.querySelector('.table-seats')!;
    seatsContainer.innerHTML = 
      `<div class="seat occupied"></div>`.repeat(occupiedCount) +
      `<div class="seat"></div>`.repeat(table.capacity - occupiedCount);

    // Update capacity text
    const capacityEl = tableEl.querySelector('.table-capacity')!;
    capacityEl.textContent = assignment ? `Party of ${occupiedCount}` : 'Empty';

    // Update time left
    let timeLeftEl = tableEl.querySelector('.time-left');
    if (assignment) {
      if (!timeLeftEl) {
        timeLeftEl = document.createElement('div');
        timeLeftEl.className = 'time-left';
        tableEl.appendChild(timeLeftEl);
      }
      timeLeftEl.textContent = `${timeLeft} min left`;
    } else if (timeLeftEl) {
      timeLeftEl.remove();
    }
  }

  public updateQueue(): void {
    const waitingQueue = this.restaurant.getWaitingQueue();
    const waitingPatronCount = this.restaurant.getWaitingPatronCount();
    const totalServed = this.restaurant.getTotalServed();

    const queueInfo = this.queueSection.querySelector('.queue-info')!;
    queueInfo.innerHTML = `
      <span>Parties waiting: <strong>${waitingQueue.length}</strong></span>
      <span>People waiting: <strong>${waitingPatronCount}</strong></span>
      <span>Total served: <strong>${totalServed}</strong></span>
    `;

    const queueList = this.queueSection.querySelector('.queue-list')!;
    queueList.innerHTML = waitingQueue.length > 0
      ? waitingQueue.map(party => `<div class="queue-party">Party of ${party.members.length}</div>`).join('')
      : '<div class="empty-queue">No one waiting</div>';
  }

  public updateTime(): void {
    this.timeDisplay.textContent = `⏰ Time: ${this.restaurant.getCurrentTime()} min`;
  }

  public updateAll(): void {
    this.updateTime();
    this.restaurant.getTableAssignments().forEach(
      ta => this.updateTable(ta.table.id)
    );
    this.updateQueue();
  }
}

function main() {

  // Create tables with different capacities
  const tables = [
    new Table(1, 2),
    new Table(2, 6),
    new Table(3, 4),
    new Table(4, 4),
    new Table(5, 2),
    new Table(6, 4),
  ];

  // Create the restaurant and GUI
  const restaurant = new Restaurant(tables);
  const gui = new RestaurantGUI(restaurant, document.querySelector<HTMLDivElement>('#app')!);

  const randomizer = Randomizer.create_from_seed("restaurant-sim");
  const partyGenerator = new PartyGenerator(randomizer, {
    arrivalRate: 0.4,
    minPartySize: 1,
    maxPartySize: 6,
    minDiningTime: 30,
    maxDiningTime: 90
  });

  // add a few random parties to start
  for (let i = 0; i < 5; i++) {
    const newParty = partyGenerator.generateParty();
    if (newParty) {
      restaurant.addToWaitingQueue(newParty);
    }
  }

  gui.updateAll();


  // Run simulation
  const duration = 240; // 4 hours until closing
  const timeStep = 5;

  for (let time = 0; time <= duration; time += timeStep) {

    // Generate new parties randomly throughout the simulation
    const newParty = partyGenerator.generateParty();
    if (newParty) {
      restaurant.addToWaitingQueue(newParty);
    }

    // TODO: run simulation and update GUI
    // sleepBlocking(100);
    // restaurant.simulateStep(timeStep);
    // gui.updateAll();
  }
}

main();