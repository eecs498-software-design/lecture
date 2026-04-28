// Type guard: checks if object has a .size property
function hasSize(obj: {}): obj is { size: unknown } {
  return "size" in obj;
}

// Type guard: checks if object has a .length property
function hasLength(obj: {}): obj is { length: unknown } {
  return "length" in obj;
}

// Type-level mirror of getSize's expected runtime behavior (see below).
// At the type level, we introspect using the extends keyword in a conditional
// type - this allows us to branch into cases depending on the presence of
// "size" or "length" keys (or neither) in T and then generate the appropriate
// return type based on an indexed access type (e.g. T["size"]).
// Note that the final never corresponds to reaching the throw in the implementation.
type SizeOrLengthType<T> =
  "size" extends keyof T ? T["size"] :
  "length" extends keyof T ? T["length"] :
  never;


// Implementation with dynamic behavior. Check for .size first,
// then .length, then throw if neither exists.
function getSize<T extends {}>(obj: T): SizeOrLengthType<T> {
  if (hasSize(obj)) {
    return obj.size as SizeOrLengthType<T>; // cast to satisfy compiler
  }
  if (hasLength(obj)) {
    return obj.length as SizeOrLengthType<T>; // cast to satisfy compiler
  }
  
  throw new Error("Object has neither .size nor .length");
}



type DrinkSize = "small" | "med" | "large";
interface Drink {
  size: DrinkSize;
}

function main() {

  const arr = [1, 2, 3, 4]; // has .length
  const map = new Map<string, number>([
    ["a", 1], 
    ["b", 2], 
    ["c", 3]
  ]); // has .size
  const set = new Set<string>();
  const x = 42;
  const drink : Drink = { size: "large"}; // has .size, of type DrinkSize

  try {
    getSize(undefined); // doesn't compile
    getSize(null);      // doesn't compile
    getSize(arr);       // returns number from .length property
    getSize(map);       // returns number from .size property
    getSize(set);       // returns number from .size property
    getSize(drink);     // returns DrinkSize from .size property
    getSize(x);         // returns never, since it always throws
  } catch (e) {
      console.log("Caught:", (e as Error).message);
  }
}

main();

export { }