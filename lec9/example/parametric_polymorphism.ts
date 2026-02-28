// ============================================================
// PARAMETRIC POLYMORPHISM (Generics)
// ============================================================
// Generic types and functions that work uniformly over ANY type,
// while preserving type information through type parameters.

import { Notification, EmailNotification, SMSNotification } from "./subtype_polymorphism";


// ------------------------------------------------------------
// The Problem: Why not just use "any"?
// ------------------------------------------------------------

// A queue that holds "any" type - this compiles, but...
class UnsafeQueue {
  private items: any[] = [];

  enqueue(item: any): void {
    this.items.push(item);
  }

  dequeue(): any {
    return this.items.shift();
  }
}

// Usage - no type safety!
const unsafeQueue = new UnsafeQueue();
unsafeQueue.enqueue(new EmailNotification("a@b.com", "Hi", "Hello"));
unsafeQueue.enqueue("oops, a string");  // No error! But this is wrong.
unsafeQueue.enqueue(42);                 // Also no error! Also wrong.

const unsafeItem = unsafeQueue.dequeue(); // Type is "any" - we lost all type info
// unsafeItem.send();                       // Would fail at runtime if we got the string!


// ------------------------------------------------------------
// The Solution: Parametric Polymorphism with Queue<T>
// ------------------------------------------------------------

// A properly generic Queue
export class SafeQueue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  peek(): T | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// Usage - full type safety!
const emailQueue = new SafeQueue<EmailNotification>();
emailQueue.enqueue(new EmailNotification("a@b.com", "Hi", "Hello"));
const email = emailQueue.dequeue();  // Type is EmailNotification | undefined
email?.send();                        // Works - compiler knows it's an EmailNotification

// emailQueue.enqueue(new SMSNotification("+1234567890", "Hi")); // ERROR: SMS is not Email
// emailQueue.enqueue("oops");                                   // ERROR: string is not Email

// Different queue, different type parameter
const smsQueue = new SafeQueue<SMSNotification>();
smsQueue.enqueue(new SMSNotification("+1234567890", "Code: 123"));
const sms = smsQueue.dequeue();  // Type is SMSNotification | undefined


// ------------------------------------------------------------
// Type Relationships: Multiple Type Parameters Must "Match"
// ------------------------------------------------------------

// Transform items from one type to another while preserving queue structure
function mapQueue<T, U>(queue: SafeQueue<T>, fn: (item: T) => U): SafeQueue<U> {
  const result = new SafeQueue<U>();
  // Note: This is destructive to the original queue for simplicity
  while (!queue.isEmpty()) {
    const item = queue.dequeue()!;
    result.enqueue(fn(item));
  }
  return result;
}

// The T's must match each other, and the U's must match each other
const notificationQueue = new SafeQueue<Notification>();
notificationQueue.enqueue(new EmailNotification("a@b.com", "Hi", "Hello"));
notificationQueue.enqueue(new SMSNotification("+123", "Code: 456"));

// Transform Notification -> string (T = Notification, U = string)
const formattedQueue = mapQueue(notificationQueue, (n: Notification) => n.format());
const formatted = formattedQueue.dequeue();  // Type is string | undefined
console.log(formatted);


// ------------------------------------------------------------
// Bounded Type Parameters: Combining Parametric + Subtype
// ------------------------------------------------------------

// "T can be any type, AS LONG AS it extends Notification"
function broadcastAll<T extends Notification>(items: T[]): void {
  for (const item of items) {
    console.log(item.format());  // We know T has format() because T extends Notification
    item.send();                  // We know T has send() because T extends Notification
  }
}

// Works with EmailNotification[], SMSNotification[], Notification[], etc.
const emails: EmailNotification[] = [
  new EmailNotification("a@b.com", "Hi", "Hello"),
  new EmailNotification("c@d.com", "Bye", "Goodbye"),
];
broadcastAll(emails);  // T = EmailNotification

const mixed: Notification[] = [
  new EmailNotification("a@b.com", "Hi", "Hello"),
  new SMSNotification("+123", "Code"),
];
broadcastAll(mixed);   // T = Notification

// But not with string[] - string doesn't extend Notification!
// broadcastAll(["hello", "world"]);  // ERROR: string doesn't satisfy constraint


export {}; // Ensure this file is treated as a module
