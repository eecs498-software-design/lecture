// AD HOC POLYMORPHISM - Different types represented as a discriminated union.
// Behavior is implemented via functions that switch on the discriminant.

export type NotificationKind = "email" | "sms";

export interface EmailData {
  kind: "email";
  recipient: string;
  subject: string;
  message: string;
}

export interface SMSData {
  kind: "sms";
  phoneNumber: string;
  message: string;
}

export type NotificationVariant = EmailData | SMSData;

// Helper for checking exhaustiveness
export function assertNever(x: never): never { throw new Error("Unexpected: " + x); }

class NotificationService {
  private queue: NotificationVariant[] = [];

  enqueue(notification: NotificationVariant): void { this.queue.push(notification); }

  processAll(): void {
    for (const notification of this.queue) {
      console.log(this.format(notification));
      this.send(notification);
    }
    this.queue = [];
  }

  // Ad hoc polymorphism: behavior varies based on the discriminant
  private send(notification: NotificationVariant): void {
    switch (notification.kind) {
      case "email": console.log(`Sending email to ${notification.recipient}...`); break;
      case "sms": console.log(`Sending SMS to ${notification.phoneNumber}...`); break;
      default: assertNever(notification);
    }
  }

  private format(notification: NotificationVariant): string {
    switch (notification.kind) {
      case "email": return `To: ${notification.recipient}\nSubject: ${notification.subject}`;
      case "sms": return `SMS to ${notification.phoneNumber}: ${notification.message}`;
      default: assertNever(notification);
    }
  }
}

const service = new NotificationService();
service.enqueue({ kind: "email", recipient: "...", subject: "...", message: "..." });
service.enqueue({ kind: "sms", phoneNumber: "...", message: "..." });
service.processAll();

export {};