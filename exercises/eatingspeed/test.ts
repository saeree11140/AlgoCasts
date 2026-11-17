import minEatingSpeed = require('./index');

test('finds the slowest speed that still finishes in time', () => {
  expect(minEatingSpeed([3, 6, 7, 11], 8)).toEqual(4);
});

test('must eat the biggest pile in one hour when h equals the number of piles', () => {
  expect(minEatingSpeed([30, 11, 23, 4, 20], 5)).toEqual(30);
});

test('one extra hour lowers the speed', () => {
  expect(minEatingSpeed([30, 11, 23, 4, 20], 6)).toEqual(23);
});

test('speed 1 is enough when there is plenty of time', () => {
  expect(minEatingSpeed([1, 1, 1, 1], 10)).toEqual(1);
  expect(minEatingSpeed([5], 5)).toEqual(1);
});

test('handles a single large pile', () => {
  expect(minEatingSpeed([1_000_000_000], 2)).toEqual(500_000_000);
  expect(minEatingSpeed([1_000_000_000], 3)).toEqual(333_333_334);
});

test('handles many piles with large values', () => {
  expect(minEatingSpeed([312884470], 312884469)).toEqual(2);
  expect(minEatingSpeed([805306368, 805306368, 805306368], 1000000000)).toEqual(3);
});
