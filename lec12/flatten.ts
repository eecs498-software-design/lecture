// Type-level mirror of flatten's expected runtime behavior (see below).
// At the type level, we introspect by checking if T is some kind of
// array using a conditional type, and if so, we use `infer Elem` to
// capture its element type. Critically, we recursively apply FlattenedElemType
// to Elem, mirroring the recursion in the actual implementation.
type FlattenedElemType<T> =
  T extends Array<infer Elem>
    ? FlattenedElemType<Elem> // recursive case
    : T; // base case

// Implementation with dynamic behavior. Recurse into nested arrays and
// collect non-array items into a single flat result array.
function flatten<T extends Array<any>>(arr: T) : FlattenedElemType<T>[] {
  const result: FlattenedElemType<T>[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item)); // recursive case
    } else {
      result.push(item); // base case
    }
  }
  return result;
}

function main() {

  // Array of arrays of numbers
  let x = flatten([
    [1, 2],
    [3, 4],
    [5]
  ]); // x is number[]

  // Array of arrays of arrays of strings
  let y = flatten([
    [["a"], ["b"]],
    [["c"], ["d"]],
    [["e"]]
  ]); // y is string[]

  // Mixed types!
  let z = flatten([
    ["a", "b", [false]],
    [42]
  ]); // z is (string | number | boolean)[]

}

main();

export {};