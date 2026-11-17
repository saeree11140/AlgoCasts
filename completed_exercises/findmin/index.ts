// --- Directions
// nums เดิมเรียงจากน้อยไปมากและไม่มีค่าซ้ำ แต่ถูกหมุนมาแล้ว 1 ถึง n ครั้ง
// คืนค่าที่น้อยที่สุดใน nums โดยต้องทำได้ใน O(log n)
// อ้างอิงรูปแบบโจทย์ LeetCode 153. Find Minimum in Rotated Sorted Array
// --- Examples
//   findMin([3, 4, 5, 1, 2]) --> 1
//   findMin([4, 5, 6, 7, 0, 1, 2]) --> 0
//   findMin([11, 13, 15, 17]) --> 11

function findMin(nums: number[]): number {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);

    // mid is bigger than the last value, so the drop (the minimum) is to the right of mid.
    if (nums[mid] > nums[right]) {
      left = mid + 1;
    } else {
      // mid itself could be the minimum, so keep it in range.
      right = mid;
    }
  }

  return nums[left];
}

export = findMin;
