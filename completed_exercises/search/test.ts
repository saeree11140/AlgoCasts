import S = require('./index');
const linearSearch = S.linearSearch;
const binarySearch = S.binarySearch;
const binarySearchRecursive = S.binarySearchRecursive;

const sorted = [-5, -1, 0, 3, 8, 13, 21];

describe('Linear search', () => {
  test('finds a value in an unsorted array', () => {
    expect(linearSearch([7, 3, 9, 4, 8], 4)).toEqual(3);
  });

  test('returns -1 when the value is missing', () => {
    expect(linearSearch([7, 3, 9, 4, 8], 5)).toEqual(-1);
    expect(linearSearch([], 1)).toEqual(-1);
  });

  test('returns the first index when the value repeats', () => {
    expect(linearSearch([2, 6, 6, 1, 6], 6)).toEqual(1);
  });
});

describe('Binary search', () => {
  test('finds every value in a sorted array', () => {
    sorted.forEach((value, index) => {
      expect(binarySearch(sorted, value)).toEqual(index);
    });
  });

  test('returns -1 for values below, between and above the array', () => {
    expect(binarySearch(sorted, -9)).toEqual(-1);
    expect(binarySearch(sorted, 4)).toEqual(-1);
    expect(binarySearch(sorted, 99)).toEqual(-1);
  });

  test('handles empty and single element arrays', () => {
    expect(binarySearch([], 3)).toEqual(-1);
    expect(binarySearch([3], 3)).toEqual(0);
    expect(binarySearch([3], 4)).toEqual(-1);
  });
});

describe('Recursive binary search', () => {
  test('finds every value in a sorted array', () => {
    sorted.forEach((value, index) => {
      expect(binarySearchRecursive(sorted, value)).toEqual(index);
    });
  });

  test('returns -1 when the value is missing', () => {
    expect(binarySearchRecursive(sorted, 4)).toEqual(-1);
    expect(binarySearchRecursive([], 4)).toEqual(-1);
  });
});
