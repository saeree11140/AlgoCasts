import mySqrt = require('./index');

test('returns the exact root of a perfect square', () => {
  expect(mySqrt(4)).toEqual(2);
});

test('rounds down when the root is not whole', () => {
  expect(mySqrt(8)).toEqual(2);
});

test('handles 0 and 1', () => {
  expect(mySqrt(0)).toEqual(0);
  expect(mySqrt(1)).toEqual(1);
});

test('matches Math.floor(Math.sqrt(x)) from 0 to 200', () => {
  for (let x = 0; x <= 200; x++) {
    expect(mySqrt(x)).toEqual(Math.floor(Math.sqrt(x)));
  }
});

test('handles large numbers', () => {
  expect(mySqrt(2147395599)).toEqual(46339);
  expect(mySqrt(2147483647)).toEqual(46340);
});
