import searchMatrix = require('./index');

function getMatrix() {
  return [
    [1, 3, 5, 7],
    [10, 11, 16, 20],
    [23, 30, 34, 60],
  ];
}

test('finds a value in the first row', () => {
  expect(searchMatrix(getMatrix(), 3)).toEqual(true);
});

test('returns false for a value between rows', () => {
  expect(searchMatrix(getMatrix(), 13)).toEqual(false);
});

test('handles an empty matrix', () => {
  expect(searchMatrix([], 1)).toEqual(false);
  expect(searchMatrix([[]], 1)).toEqual(false);
});

test('finds every value in the matrix', () => {
  const matrix = getMatrix();
  for (const row of matrix) {
    for (const value of row) {
      expect(searchMatrix(matrix, value)).toEqual(true);
    }
  }
});

test('returns false for values outside the matrix', () => {
  expect(searchMatrix(getMatrix(), 0)).toEqual(false);
  expect(searchMatrix(getMatrix(), 61)).toEqual(false);
});

test('handles a single row and a single column', () => {
  expect(searchMatrix([[1, 3, 5]], 5)).toEqual(true);
  expect(searchMatrix([[1], [3], [5]], 3)).toEqual(true);
  expect(searchMatrix([[1], [3], [5]], 4)).toEqual(false);
});
