import firstBadVersion = require('./index');

function checker(firstBad: number) {
  const calls: number[] = [];
  const isBad = (version: number) => {
    calls.push(version);
    return version >= firstBad;
  };
  return { isBad, calls };
}

test('finds the first bad version', () => {
  const { isBad } = checker(4);
  expect(firstBadVersion(5, isBad)).toEqual(4);
});

test('handles a single version', () => {
  const { isBad } = checker(1);
  expect(firstBadVersion(1, isBad)).toEqual(1);
});

test('handles the first and last version being the first bad one', () => {
  expect(firstBadVersion(10, checker(1).isBad)).toEqual(1);
  expect(firstBadVersion(10, checker(10).isBad)).toEqual(10);
});

test('finds every possible answer for n = 50', () => {
  for (let bad = 1; bad <= 50; bad++) {
    expect(firstBadVersion(50, checker(bad).isBad)).toEqual(bad);
  }
});

test('calls isBad only O(log n) times', () => {
  const { isBad, calls } = checker(1_234_567_890);
  expect(firstBadVersion(2_147_483_647, isBad)).toEqual(1_234_567_890);
  expect(calls.length <= 32).toBe(true);
});
