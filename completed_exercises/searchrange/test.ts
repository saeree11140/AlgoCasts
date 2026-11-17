import searchRange = require('./index');

test('finds the first and last position of a repeated value', () => {
  expect(searchRange([5, 7, 7, 8, 8, 10], 8)).toEqual([3, 4]);
});

test('returns [-1, -1] when the value is missing', () => {
  expect(searchRange([5, 7, 7, 8, 8, 10], 6)).toEqual([-1, -1]);
});

test('returns [-1, -1] for an empty array', () => {
  expect(searchRange([], 0)).toEqual([-1, -1]);
});

test('returns the same index twice for a single match', () => {
  expect(searchRange([1, 2, 3], 2)).toEqual([1, 1]);
});

test('handles runs at both ends of the array', () => {
  expect(searchRange([2, 2, 2, 3, 4], 2)).toEqual([0, 2]);
  expect(searchRange([1, 4, 9, 9, 9], 9)).toEqual([2, 4]);
});

test('handles an array where every value matches', () => {
  expect(searchRange([6, 6, 6, 6, 6, 6], 6)).toEqual([0, 5]);
});

test('returns [-1, -1] for values outside the range', () => {
  expect(searchRange([3, 4, 5], 1)).toEqual([-1, -1]);
  expect(searchRange([3, 4, 5], 8)).toEqual([-1, -1]);
});
