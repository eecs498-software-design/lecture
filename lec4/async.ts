
interface BreakfastItem {
  name: string;
  emoji: string;
  prepTime: number; // in milliseconds (not realistic lol)
}

const breakfastMenu: BreakfastItem[] = [
  { name: "egg", emoji: "🥚", prepTime: 1000 },
  { name: "bacon", emoji: "🥓", prepTime: 1500 },
  { name: "toast", emoji: "🍞", prepTime: 500 },
  { name: "pancakes", emoji: "🥞", prepTime: 2000 },
  { name: "banana", emoji: "🍌", prepTime: 300 },
  { name: "coffee", emoji: "☕", prepTime: 800 },
];

function cook() {
  console.log("🔴 Starting Sync Block (Main thread is now trapped)...");
  const start = Date.now();
  while (Date.now() - start < 3000) {
      // This loop does nothing but hog the CPU
  }
  console.log("⚠️ Sync Block finished.");
}

