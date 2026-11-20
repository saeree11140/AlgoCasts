// Tent Packing Problem Solution
// Returns the minimum number of tents needed and the tent sizes used, or -1 if impossible
export function minTentPacking(
  numPeople: number,
  tentSizes: number[]
): { count: number; sizes: number[] } | -1 {
  // BOTTOM-UP DP
  // Edge cases
  if (numPeople === 0) return { count: 0, sizes: [] };
  if (tentSizes.length === 0) return -1;

  // 1. Deduplicate and sort descending
  const uniqueSizes = [...new Set(tentSizes)].sort((a, b) => b - a);

  // 2. Create DP array
  const dp: number[] = new Array(numPeople + 1).fill(Infinity);
  dp[0] = 0;

  // Parent array for reconstructing solution
  const parent: number[] = new Array(numPeople + 1).fill(-1);

  // 3. Fill DP table
  for (let i = 1; i <= numPeople; i++) {
    for (const size of uniqueSizes) {
      if (i >= size && dp[i - size] !== Infinity) {
        const newCount = dp[i - size] + 1;
        if (newCount < dp[i]) {
          dp[i] = newCount;
          parent[i] = size;
        }
      }
    }
  }

  // 4. Check if solution exists
  if (dp[numPeople] === Infinity) {
    return -1;
  }

  // 5. Reconstruct solution
  const result: number[] = [];
  let current = numPeople;

  while (current > 0) {
    const tentSize = parent[current];
    result.push(tentSize);
    current -= tentSize;
  }

  // result.sort((a, b) => b - a);

  return {
    count: dp[numPeople],
    sizes: result,
  };
}
