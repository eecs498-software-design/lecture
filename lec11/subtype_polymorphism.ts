// Cloud Storage System - Subtype Polymorphism
// Operations are methods on the node classes themselves
// Adding a new operation requires modifying ALL node classes

// --- Node Base Class ---
abstract class DriveNode {
  name: string;
  owner: string;
  sharedWith: Set<string>;

  constructor(name: string, owner: string) {
    this.name = name;
    this.owner = owner;
    this.sharedWith = new Set();
  }

  // Each operation is a method - must be implemented by all subclasses
  abstract calculateSize(): number;
  abstract auditPermissions(): string[];
  abstract export(depth?: number): string;
}

// --- Concrete Node Types ---
class DriveFile extends DriveNode {
  sizeBytes: number;
  mimeType: string;

  constructor(name: string, owner: string, sizeBytes: number, mimeType: string) {
    super(name, owner);
    this.sizeBytes = sizeBytes;
    this.mimeType = mimeType;
  }

  calculateSize(): number {
    return this.sizeBytes;
  }

  auditPermissions(): string[] {
    if (this.sharedWith.size > 0) {
      return [`File '${this.name}' shared with: ${[...this.sharedWith].join(", ")}`];
    }
    return [];
  }

  export(depth = 0): string {
    return "  ".repeat(depth) + `📄 ${this.name}\n`;
  }
}

class DriveFolder extends DriveNode {
  children: DriveNode[] = [];

  constructor(name: string, owner: string) {
    super(name, owner);
  }

  addChild(child: DriveNode) {
    this.children.push(child);
  }

  calculateSize(): number {
    return this.children.reduce((sum, child) => sum + child.calculateSize(), 0);
  }

  auditPermissions(): string[] {
    const result: string[] = [];
    if (this.sharedWith.size > 0) {
      result.push(`Folder '${this.name}' shared with: ${[...this.sharedWith].join(", ")}`);
    }
    for (const child of this.children) {
      result.push(...child.auditPermissions());
    }
    return result;
  }

  export(depth = 0): string {
    let result = "  ".repeat(depth) + `📁 ${this.name}/\n`;
    for (const child of this.children) {
      result += child.export(depth + 1);
    }
    return result;
  }
}

class DriveShortcut extends DriveNode {
  target: DriveNode;

  constructor(name: string, owner: string, target: DriveNode) {
    super(name, owner);
    this.target = target;
  }

  calculateSize(): number {
    return 0; // Links don't count
  }

  auditPermissions(): string[] {
    if (this.sharedWith.size > 0) {
      return [`Shortcut '${this.name}' shared with: ${[...this.sharedWith].join(", ")}`];
    }
    return [];
  }

  export(depth = 0): string {
    return "  ".repeat(depth) + `🔗 ${this.name} → ${this.target.name}\n`;
  }
}

// --- Demo ---
function main() {
  // Build file structure
  const root = new DriveFolder("My Drive", "alice");
  const docs = new DriveFolder("Documents", "alice");
  docs.sharedWith.add("bob");
  const resume = new DriveFile("resume.pdf", "alice", 245000, "application/pdf");
  const notes = new DriveFile("notes.txt", "alice", 1200, "text/plain");
  notes.sharedWith.add("carol");
  docs.addChild(resume);
  docs.addChild(notes);
  const photos = new DriveFolder("Photos", "alice");
  photos.sharedWith.add("family");
  photos.addChild(new DriveFile("vacation.jpg", "alice", 4500000, "image/jpeg"));
  root.addChild(docs);
  root.addChild(photos);
  root.addChild(new DriveShortcut("Quick Resume", "alice", resume));

  // Use operations - defined as methods on each node class
  console.log("Total:", Math.floor(root.calculateSize() / 1024), "KB");
  root.auditPermissions().forEach(e => console.log(e));
  console.log(root.export());
}

main();

// TRADEOFF: Adding a new node type (e.g., SharedDrive) is easy - just add a class.
// But adding a new operation (e.g., findDuplicates) requires modifying ALL classes!
