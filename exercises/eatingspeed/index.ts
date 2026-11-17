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

function minEatingSpeed(piles: number[], h: number): number | undefined {
  return undefined;
}

export = minEatingSpeed;
