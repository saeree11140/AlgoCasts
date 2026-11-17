// --- Directions
// มีซอฟต์แวร์เวอร์ชัน 1 ถึง n ตั้งแต่เวอร์ชันที่เสียเวอร์ชันแรก ทุกเวอร์ชันหลังจากนั้นเสียหมด
// isBad(version) คืน true ถ้าเวอร์ชันนั้นเสีย
// คืนเลขเวอร์ชันแรกที่เสีย โดยเรียก isBad ให้น้อยที่สุด (ไม่เกินราว log2(n) + 1 ครั้ง)
// รับประกันว่ามีเวอร์ชันเสียอย่างน้อย 1 เวอร์ชัน
// อ้างอิงรูปแบบโจทย์ LeetCode 278. First Bad Version
// --- Examples
//   n = 5, เวอร์ชันแรกที่เสียคือ 4
//   isBad(3) --> false, isBad(4) --> true, isBad(5) --> true
//   firstBadVersion(5, isBad) --> 4

function firstBadVersion(n: number, isBad: (version: number) => boolean): number {
  let left = 1;
  let right = n;

  // Keep the first bad version inside [left, right] until only one candidate is left.
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);

    if (isBad(mid)) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }

  return left;
}

export = firstBadVersion;
