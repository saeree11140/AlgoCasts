// --- Directions
// Print out the n-th entry in the fibonacci series.
// The fibonacci series is an ordering of numbers where
// each number is the sum of the preceeding two.
// For example, the sequence
//  [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
// forms the first ten entries of the fibonacci series.
// Example:
//   fib(4) === 3

function memoize(fn: (n: number) => number): (n: number) => number {
  const cache: Record<string, number> = {};
  return function(this: unknown, ...args: [number]): number {
    if (cache[String(args)]) {
      return cache[String(args)];
    }

    const result = fn.apply(this, args);
    cache[String(args)] = result;

    return result;
  };
}

function slowFib(n: number): number {
  if (n < 2) {
    return n;
  }

  return fib(n - 1) + fib(n - 2);
}

const fib = memoize(slowFib);

export = fib;

// function fib(n) {
//   const result = [0, 1];
//
//   for (let i = 2; i <= n; i++) {
//     const a = result[i - 1];
//     const b = result[i - 2];
//
//     result.push(a + b);
//   }
//
//   return result[n];
// }
