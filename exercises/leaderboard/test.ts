import climbingLeaderboard = require('./index');

test('ranks the player after each game', () => {
  expect(climbingLeaderboard([100, 100, 50, 40, 40, 20, 10], [5, 25, 50, 120])).toEqual([6, 4, 2, 1]);
});

test('uses dense ranking for tied scores', () => {
  expect(climbingLeaderboard([100, 90, 90, 80, 75, 60], [50, 65, 77, 90, 102])).toEqual([6, 5, 4, 2, 1]);
});

test('a tie with the top score is rank 1', () => {
  expect(climbingLeaderboard([100], [100])).toEqual([1]);
});

test('scores below everyone come last', () => {
  expect(climbingLeaderboard([50, 40, 30], [1, 2])).toEqual([4, 4]);
});

test('handles a large leaderboard', () => {
  const ranked = Array.from({ length: 50000 }, (_, i) => 100000 - i * 2);
  const player = Array.from({ length: 50000 }, (_, i) => i * 2 + 1);
  const result = climbingLeaderboard(ranked, player)!;
  expect(result[0]).toEqual(50001);
  // 99999 is only beaten by 100000.
  expect(result[result.length - 1]).toEqual(2);
});
