// --- Directions
// รับจำนวนเต็ม x ที่ไม่ติดลบ คืนรากที่สองของ x ปัดเศษลง
// ห้ามใช้ Math.sqrt, Math.pow หรือ x ** 0.5
// ให้มองว่าคำตอบอยู่ในช่วง 0 ถึง x แล้วใช้ binary search หาค่า m ที่มากที่สุดซึ่ง m * m <= x
// อ้างอิงรูปแบบโจทย์ LeetCode 69. Sqrt(x)
// --- Examples
//   mySqrt(4) --> 2
//   mySqrt(8) --> 2   (รากที่สองจริงคือ 2.828...)
//   mySqrt(0) --> 0

function mySqrt(x: number): number {
  let left = 0;
  let right = x;
  let answer = 0;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (mid * mid <= x) {
      // mid works; remember it and try a bigger number.
      answer = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return answer;
}

export = mySqrt;
