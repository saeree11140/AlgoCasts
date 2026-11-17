// --- Directions
// matrix ขนาด m × n มีคุณสมบัติ 2 ข้อ
// 1. แต่ละแถวเรียงจากน้อยไปมาก
// 2. ค่าแรกของแต่ละแถวมากกว่าค่าสุดท้ายของแถวก่อนหน้า
// คืน true ถ้าพบ target ใน matrix ไม่เช่นนั้นคืน false โดยต้องทำได้ใน O(log(m × n))
// อ้างอิงรูปแบบโจทย์ LeetCode 74. Search a 2D Matrix
// --- Examples
//   const matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]];
//   searchMatrix(matrix, 3) --> true
//   searchMatrix(matrix, 13) --> false

function searchMatrix(matrix: number[][], target: number): boolean {
  const rows = matrix.length;
  const cols = rows ? matrix[0].length : 0;

  // Treat the matrix as one sorted array of rows * cols values.
  let left = 0;
  let right = rows * cols - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    const value = matrix[Math.floor(mid / cols)][mid % cols];

    if (value === target) {
      return true;
    } else if (value < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return false;
}

export = searchMatrix;
