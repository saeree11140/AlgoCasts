import hashUrl = require('./index');

test('hashes the example url into "psps"', () => {
  expect(hashUrl('https://xyz.com', 'pqrst', 4)).toBe('psps');
});

test('maps ":", "/" and "." to 26, 27 and 28', () => {
  expect(hashUrl(':/.', 'abcdefghijklmnopqrstuvwxyz0123', 1)).toBe('012');
});

test('keeps a shorter last block', () => {
  // blocks "ab" = 1, "c" = 2
  expect(hashUrl('abc', 'xyz', 2)).toBe('yz');
});

test('uses one block when k is longer than the url', () => {
  // "abc" = 0 + 1 + 2 = 3 → 3 % 2 = 1
  expect(hashUrl('abc', 'ab', 10)).toBe('b');
});

test('returns an empty string for an empty url', () => {
  expect(hashUrl('', 'pqrst', 3)).toBe('');
});

test('hashes a long url in a single pass', () => {
  const url = 'a'.repeat(99999) + 'b';
  expect(hashUrl(url, 'xy', 1)).toBe('x'.repeat(99999) + 'y');
});
