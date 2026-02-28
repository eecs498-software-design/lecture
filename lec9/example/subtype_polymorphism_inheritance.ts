// SUBTYPE POLYMORPHISM (Inheritance) - Subclasses share a common base class.
// Each subclass provides its own implementation of send() and format().

export abstract class Notification {
  constructor(protected recipient: string, protected message: string) {}
  abstract send(): void;
  abstract format(): string;
}

export class EmailNotification extends Notification {
  constructor(recipient: string, private subject: string, message: string) {
    super(recipient, message);
  }

  send(): void { /* Connect to SMTP server and send email */ }

  format(): string {
    return `📧 To: ${this.recipient}\nSubject: ${this.subject}\n\n${this.message}`;
  }
}

export class SMSNotification extends Notification {
  constructor(private phoneNumber: string, message: string) {
    super(phoneNumber, message);
  }

  send(): void { /* Connect to SMS gateway and send text */ }

  format(): string {
    return `📱 SMS to ${this.phoneNumber}: ${this.message}`;
  }
}

class NotificationService {
  // Can hold any Notification subclass.
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
