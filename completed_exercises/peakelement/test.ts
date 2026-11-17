import findPeakElement = require('./index');

function isPeak(nums: number[], index: number | undefined) {
  if (index === undefined || !Number.isInteger(index) || index < 0 || index >= nums.length) {
    return false;
  }
  const left = index === 0 ? -Infinity : nums[index - 1];
  const right = index === nums.length - 1 ? -Infinity : nums[index + 1];
  return nums[index] > left && nums[index] > right;
}

test('finds the single peak', () => {
  expect(findPeakElement([1, 2, 3, 1])).toEqual(2);
});

test('returns any valid peak when there are several', () => {
  const nums = [1, 2, 1, 3, 5, 6, 4];
  expect(isPeak(nums, findPeakElement(nums))).toBe(true);
});

test('handles a single element', () => {
  expect(findPeakElement([3])).toEqual(0);
});

test('handles peaks at either edge', () => {
  expect(findPeakElement([9, 4, 2, 1])).toEqual(0);
  expect(findPeakElement([1, 2, 4, 9])).toEqual(3);
});

test('always returns a valid peak', () => {
  const cases = [
    [2, 1],
    [1, 2],
    [1, 3, 2, 4, 3, 5, 4],
    [5, 1, 4, 2, 8, 3, 9, 0],
    [-3, -1, -2, 0, -5],
  ];
  for (const nums of cases) {
    expect(isPeak(nums, findPeakElement(nums))).toBe(true);
  }
});
