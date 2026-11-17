import whatFlavors = require('./index');

test('finds two flavors that use all the money', () => {
  expect(whatFlavors([1, 4, 5, 3, 2], 4)).toEqual([1, 4]);
});

test('handles two flavors with the same price', () => {
  expect(whatFlavors([2, 2, 4, 3], 4)).toEqual([1, 2]);
});

test('returns 1-based indices in ascending order', () => {
  expect(whatFlavors([7, 2, 5, 4, 11], 12)).toEqual([1, 3]);
});

test('does not use the same flavor twice', () => {
  expect(whatFlavors([3, 1, 4, 3], 6)).toEqual([1, 4]);
});

test('finds the pair at the end of a long menu', () => {
  const cost = Array.from({ length: 10000 }, () => 1);
  cost.push(500, 600);
  expect(whatFlavors(cost, 1100)).toEqual([10001, 10002]);
});
