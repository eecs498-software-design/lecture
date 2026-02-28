// SUBTYPE POLYMORPHISM - Different types share a common interface.
// Each class implements the interface with its own send() and format().

export interface Notification {
  send(): void;
  format(): string;
}

export class EmailNotification implements Notification {
  constructor(
    private recipient: string,
    private subject: string,
    private message: string
  ) {}

  send(): void { /* Connect to SMTP server and send email */ }

  format(): string {
    return `To: ${this.recipient}\nSubject: ${this.subject}\n\n${this.message}`;
  }
}

export class SMSNotification implements Notification {
  constructor(private phoneNumber: string, private message: string) {}

  send(): void { /* Connect to SMS gateway and send text */ }

  format(): string {
    return `SMS to ${this.phoneNumber}: ${this.message}`;
  }
}

class NotificationService {
  // Can hold any type that implements Notification.
  private queue: Notification[] = [];

  enqueue(notification: Notification): void { this.queue.push(notification); }

  processAll(): void {
    for (const notification of this.queue) {
      console.log(`Sending: ${notification.format()}`);
      notification.send();
    }
    this.queue = [];
  }
}

function main() {
  const service = new NotificationService();
  service.enqueue(new EmailNotification("user@example.com", "Welcome!", "Thanks!"));
  service.enqueue(new SMSNotification("+1234567890", "Your code is 123456"));
  service.processAll();
}

main();
