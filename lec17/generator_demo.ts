
// co-routines
// cooperative routines (functions)
// generators in TS/JS, technically semi-coroutines
//   still only return to their caller, but they can pause and resume

// generator = function*
function* foo(str: string) : Generator<string, string, string> {
  let x = 0;
  while(true) {
    console.log(`Received input: ${str}`);
    str = yield `${str} ${x++}`;
  }
}

function main() {
  const gen = foo("Hello"); // initial input
  
  console.log(gen.next("apple"));
  console.log(gen.next("banana"));
  
}

main();