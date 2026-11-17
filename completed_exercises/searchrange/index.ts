// --- Directions
// รับ nums ที่เรียงจากน้อยไปมาก (มีค่าซ้ำได้) และ target
// คืน [ตำแหน่งแรก, ตำแหน่งสุดท้าย] ของ target ถ้าไม่พบให้คืน [-1, -1]
// ต้องทำได้ใน O(log n) ห้ามไล่ทีละตัว
// อ้างอิงรูปแบบโจทย์ LeetCode 34. Find First and Last Position of Element in Sorted Array
// --- Examples
//   searchRange([5, 7, 7, 8, 8, 10], 8) --> [3, 4]
//   searchRange([5, 7, 7, 8, 8, 10], 6) --> [-1, -1]
//   searchRange([], 0) --> [-1, -1]

// Index of the first value >= target (or nums.length when every value is smaller).
function lowerBound(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length;

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}

function searchRange(nums: number[], target: number): number[] {
  const first = lowerBound(nums, target);

  if (first === nums.length || nums[first] !== target) {
    return [-1, -1];
  }

  // The first value > target sits where target + 1 would be inserted.
  const last = lowerBound(nums, target + 1) - 1;
  return [first, last];
}

export = searchRange;
