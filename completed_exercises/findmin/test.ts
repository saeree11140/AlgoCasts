import findMin = require('./index');

test('finds the minimum after a rotation', () => {
  expect(findMin([3, 4, 5, 1, 2])).toEqual(1);
});

test('finds the minimum in the middle of the array', () => {
  expect(findMin([4, 5, 6, 7, 0, 1, 2])).toEqual(0);
});

test('returns the first value when the array is fully rotated', () => {
  expect(findMin([11, 13, 15, 17])).toEqual(11);
});

test('handles one and two element arrays', () => {
  expect(findMin([5])).toEqual(5);
  expect(findMin([2, 1])).toEqual(1);
  expect(findMin([1, 2])).toEqual(1);
});

test('finds the minimum for every rotation', () => {
  const base = [-8, -3, 0, 4, 9, 12, 20, 31];
  for (let shift = 0; shift < base.length; shift++) {
    expect(findMin([...base.slice(shift), ...base.slice(0, shift)])).toEqual(-8);
  }
});
