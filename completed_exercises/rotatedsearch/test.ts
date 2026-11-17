import search = require('./index');

test('finds a value in the rotated right half', () => {
  expect(search([4, 5, 6, 7, 0, 1, 2], 0)).toEqual(4);
});

test('returns -1 when the value is missing', () => {
  expect(search([4, 5, 6, 7, 0, 1, 2], 3)).toEqual(-1);
});

test('handles a single element array', () => {
  expect(search([1], 0)).toEqual(-1);
  expect(search([1], 1)).toEqual(0);
});

test('finds a value in the left half', () => {
  expect(search([4, 5, 6, 7, 0, 1, 2], 5)).toEqual(1);
});

test('finds every value for every rotation', () => {
  const base = [1, 3, 5, 7, 9, 11, 13];
  for (let shift = 0; shift < base.length; shift++) {
    const rotated = [...base.slice(shift), ...base.slice(0, shift)];
    rotated.forEach((value, index) => {
      expect(search(rotated, value)).toEqual(index);
    });
    expect(search(rotated, 8)).toEqual(-1);
  }
});

test('handles a two element rotated array', () => {
  expect(search([3, 1], 1)).toEqual(1);
  expect(search([3, 1], 3)).toEqual(0);
});
