// --- Directions
// ranked คือคะแนนบน leaderboard เรียงจากมากไปน้อย (อาจมีคะแนนซ้ำ)
// ระบบจัดอันดับแบบ dense ranking: คะแนนเท่ากันได้อันดับเดียวกัน
// และคะแนนถัดไปได้อันดับถัดไปทันที เช่น [100, 90, 90, 80] ได้อันดับ 1, 2, 2, 3
// player คือคะแนนของผู้เล่นแต่ละเกม เรียงจากน้อยไปมาก
// คืน array อันดับของผู้เล่นหลังจบแต่ละเกม
// อ้างอิงรูปแบบโจทย์ HackerRank: Climbing the Leaderboard
// --- Examples
//   climbingLeaderboard([100, 100, 50, 40, 40, 20, 10], [5, 25, 50, 120])
//     --> [6, 4, 2, 1]

function climbingLeaderboard(ranked: number[], player: number[]): number[] {
  // Unique scores, highest first. The rank of unique[i] is i + 1.
  const unique = ranked.filter((score, i) => i === 0 || score !== ranked[i - 1]);

  return player.map(score => {
    // Count how many unique scores are strictly greater than this score.
    let left = 0;
    let right = unique.length;

    while (left < right) {
      const mid = left + Math.floor((right - left) / 2);

      if (unique[mid] > score) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    return left + 1;
  });
}

export = climbingLeaderboard;
