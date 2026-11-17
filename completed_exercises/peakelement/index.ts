// --- Directions
// peak คือค่าที่มากกว่าเพื่อนบ้านทั้งซ้ายและขวา ให้ถือว่านอกขอบ array มีค่าเป็น -Infinity
// nums ไม่มีค่าที่ติดกันเท่ากัน คืน index ของ peak ตัวใดก็ได้ โดยต้องทำได้ใน O(log n)
// อ้างอิงรูปแบบโจทย์ LeetCode 162. Find Peak Element
// --- Examples
//   findPeakElement([1, 2, 3, 1]) --> 2
//   findPeakElement([1, 2, 1, 3, 5, 6, 4]) --> 1 หรือ 5 ก็ได้
//   findPeakElement([3]) --> 0

function findPeakElement(nums: number[]): number {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);

    // Going uphill to the right means a peak must exist on the right side.
    if (nums[mid] < nums[mid + 1]) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}

export = findPeakElement;
