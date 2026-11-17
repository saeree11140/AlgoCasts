// --- Directions
// nums เดิมเรียงจากน้อยไปมากและไม่มีค่าซ้ำ แต่ถูกหมุน (rotate) ณ จุดใดจุดหนึ่ง
// เช่น [0, 1, 2, 4, 5, 6, 7] อาจกลายเป็น [4, 5, 6, 7, 0, 1, 2]
// คืน index ของ target ถ้าไม่พบให้คืน -1 โดยต้องทำได้ใน O(log n)
// อ้างอิงรูปแบบโจทย์ LeetCode 33. Search in Rotated Sorted Array
// --- Examples
//   search([4, 5, 6, 7, 0, 1, 2], 0) --> 4
//   search([4, 5, 6, 7, 0, 1, 2], 3) --> -1
//   search([1], 0) --> -1

function search(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) {
      return mid;
    }

    // At least one half is always in order. Find it, then check if target lives there.
    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  return -1;
}

export = search;
