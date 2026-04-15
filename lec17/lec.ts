
import { readFileSync } from "node:fs";

function getFileData() {
  console.log("A");
  const data = readFileSync("data.txt", "utf-8");
  console.log("B");
  console.log("Data length:", data.length);
}

main();