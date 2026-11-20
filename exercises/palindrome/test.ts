import isPalindrome = require('./index');

test('Test Case 1: "A man, a plan, a canal: Panama" is a palindrome', () => {
  expect(isPalindrome('A man, a plan, a canal: Panama')).toBe(true);
});

test('Test Case 2: "race a car" is not a palindrome', () => {
  expect(isPalindrome('race a car')).toBe(false);
});

test('Test Case 3: " " is a palindrome (empty after cleanup)', () => {
  expect(isPalindrome(' ')).toBe(true);
});

test('isPalindrome function is defined', () => {
  expect(typeof isPalindrome).toEqual('function');
});

test('empty string is a palindrome', () => {
  expect(isPalindrome('')).toBe(true);
});

test('"aba" is a palindrome', () => {
  expect(isPalindrome('aba')).toBe(true);
});

test('spaces around the text are ignored: " aba " is a palindrome', () => {
  expect(isPalindrome(' aba ')).toBe(true);
});

test('case is ignored: "Fish hsif" is a palindrome', () => {
  expect(isPalindrome('Fish hsif')).toBe(true);
});

test('punctuation is ignored: "No \'x\' in Nixon" is a palindrome', () => {
  expect(isPalindrome("No 'x' in Nixon")).toBe(true);
});

test('underscore is not alphanumeric: "ab_a" is a palindrome', () => {
  expect(isPalindrome('ab_a')).toBe(true);
});

test('digits count as characters: "0P" is not a palindrome', () => {
  expect(isPalindrome('0P')).toBe(false);
});

test('"1000000001" is a palindrome', () => {
  expect(isPalindrome('1000000001')).toBe(true);
});

test('"greetings" is not a palindrome', () => {
  expect(isPalindrome('greetings')).toBe(false);
});

test('mismatch in the middle: "abcda" is not a palindrome', () => {
  expect(isPalindrome('abcda')).toBe(false);
});
