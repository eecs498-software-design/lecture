// Cloud Storage System - Ad Hoc Polymorphism
// Operations are external functions that dispatch based on type
// Adding a new operation is easy - just write a new function!

// --- Node Types (no operation methods) ---
type DriveNode = DriveFile | DriveFolder | DriveShortcut;

interface NodeBase {
  name: string;
  owner: string;
  sharedWith: Set<string>;
}

interface DriveFile extends NodeBase {
  kind: "file";
  sizeBytes: number;
  mimeType: string;
}

interface DriveFolder extends NodeBase {
  kind: "folder";
  children: DriveNode[];
}

interface DriveShortcut extends NodeBase {
  kind: "shortcut";
  target: DriveNode;
}

// --- Factory functions ---
function createFile(name: string, owner: string, sizeBytes: number, mimeType: string): DriveFile {
  return { kind: "file", name, owner, sizeBytes, mimeType, sharedWith: new Set() };
}

function createFolder(name: string, owner: string): DriveFolder {
  return { kind: "folder", name, owner, children: [], sharedWith: new Set() };
}

function createShortcut(name: string, owner: string, target: DriveNode): DriveShortcut {
  return { kind: "shortcut", name, owner, target, sharedWith: new Set() };
}

// --- Operation 1: Calculate size (external function) ---
function calculateSize(node: DriveNode): number {
  switch (node.kind) {
    case "file":
      return node.sizeBytes;
    case "folder":
      return node.children.reduce((sum, child) => sum + calculateSize(child), 0);
    case "shortcut":
      return 0; // Links don't count
  }
}

// --- Operation 2: Audit permissions (external function) ---
function auditPermissions(node: DriveNode): string[] {
  const result: string[] = [];
  if (node.sharedWith.size > 0) {
    const type = node.kind.charAt(0).toUpperCase() + node.kind.slice(1);
    result.push(`${type} '${node.name}' shared with: ${[...node.sharedWith].join(", ")}`);
  }
  if (node.kind === "folder") {
    for (const child of node.children) {
      result.push(...auditPermissions(child));
    }
  }
  return result;
}

// --- Operation 3: Export file tree (external function) ---
function exportTree(node: DriveNode, depth = 0): string {
  const indent = "  ".repeat(depth);
  switch (node.kind) {
    case "file":
      return indent + `📄 ${node.name}\n`;
    case "folder":
      let result = indent + `📁 ${node.name}/\n`;
      for (const child of node.children) {
        result += exportTree(child, depth + 1);
      }
      return result;
    case "shortcut":
      return indent + `🔗 ${node.name} → ${node.target.name}\n`;
  }
}

// --- Demo ---
function main() {
  // Build file structure
  const root = createFolder("My Drive", "alice");
  const docs = createFolder("Documents", "alice");
  docs.sharedWith.add("bob");
  const resume = createFile("resume.pdf", "alice", 245000, "application/pdf");
  const notes = createFile("notes.txt", "alice", 1200, "text/plain");
  notes.sharedWith.add("carol");
  docs.children.push(resume, notes);
  const photos = createFolder("Photos", "alice");
  photos.sharedWith.add("family");
  photos.children.push(createFile("vacation.jpg", "alice", 4500000, "image/jpeg"));
  root.children.push(docs, photos);
  root.children.push(createShortcut("Quick Resume", "alice", resume));

  // Use operations - defined as external functions
  console.log("Total:", Math.floor(calculateSize(root) / 1024), "KB");
  auditPermissions(root).forEach(e => console.log(e));
  console.log(exportTree(root));
}

main();

// TRADEOFF: Adding a new operation (e.g., findDuplicates) is easy - just add a function.
// But adding a new node type (e.g., SharedDrive) requires modifying ALL operation functions!


export {};