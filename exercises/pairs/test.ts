import pairs = require('./index');

test('counts pairs with the target difference', () => {
  expect(pairs(2, [1, 5, 3, 4, 2])).toEqual(3);
});

test('counts consecutive pairs', () => {
  expect(pairs(1, [1, 2, 3, 4])).toEqual(3);
});

test('returns 0 when no pair matches', () => {
  expect(pairs(10, [1, 2, 3])).toEqual(0);
});

test('works with negative numbers', () => {
  expect(pairs(3, [-4, -1, 2, 5, 0])).toEqual(3);
});

test('does not modify the input array', () => {
  const arr = [9, 1, 5];
  pairs(4, arr);
  expect(arr).toEqual([9, 1, 5]);
});

test('handles a large input', () => {
  const arr = Array.from({ length: 20000 }, (_, i) => i * 3);
  expect(pairs(3, arr)).toEqual(19999);
  expect(pairs(6, arr)).toEqual(19998);
});
