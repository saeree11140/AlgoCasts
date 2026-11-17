// --- Directions
// piles[i] คือจำนวนกล้วยในกองที่ i คนกินต้องกินให้หมดภายใน h ชั่วโมง
// ถ้ากินด้วยความเร็ว k ลูกต่อชั่วโมง แต่ละชั่วโมงจะกินได้แค่กองเดียว
// ถ้ากองนั้นเหลือน้อยกว่า k ก็กินหมดกองแล้วรอชั่วโมงถัดไป
// คืนค่า k ที่น้อยที่สุดซึ่งยังกินหมดทันเวลา (รับประกันว่า h >= piles.length)
// อ้างอิงรูปแบบโจทย์ LeetCode 875. Koko Eating Bananas
// --- Examples
//   minEatingSpeed([3, 6, 7, 11], 8) --> 4
//   minEatingSpeed([30, 11, 23, 4, 20], 5) --> 30
//   minEatingSpeed([30, 11, 23, 4, 20], 6) --> 23

function hoursNeeded(piles: number[], speed: number): number {
  let hours = 0;
  for (const pile of piles) {
    hours += Math.ceil(pile / speed);
  }
  return hours;
}

function minEatingSpeed(piles: number[], h: number): number {
  // The answer is between 1 and the biggest pile; faster than that never helps.
  let left = 1;
  let right = Math.max(...piles);

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);

    if (hoursNeeded(piles, mid) <= h) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }

  return left;
}

export = minEatingSpeed;
