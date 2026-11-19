// --- Directions
// เขียนฟังก์ชันค้นหา 3 ตัว ทุกตัวคืน index ของ target ถ้าไม่พบให้คืน -1
// 1. linearSearch(arr, target) ไล่ดูทีละตัวจากซ้ายไปขวา ใช้กับ array ที่ไม่เรียงได้
//    ถ้ามีค่าซ้ำให้คืน index แรกที่พบ
// 2. binarySearch(arr, target) ใช้ while loop ตัดช่วงค้นหาทีละครึ่ง
//    arr เรียงจากน้อยไปมากและไม่มีค่าซ้ำ
// 3. binarySearchRecursive(arr, target) ทำแบบเดียวกับข้อ 2 แต่ใช้ recursion
//    ส่ง left และ right ต่อไปในแต่ละ call แทนการ slice array
// --- Examples
//   linearSearch([7, 3, 9, 4], 4) --> 3
//   linearSearch([7, 3, 9, 4], 5) --> -1
//   binarySearch([1, 3, 5, 7, 9, 11], 9) --> 4
//   binarySearchRecursive([1, 3, 5, 7, 9, 11], 2) --> -1

function linearSearch(arr: number[], target: number): number | undefined {
  return undefined;
}

function binarySearch(arr: number[], target: number): number | undefined {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
}

function binarySearchRecursive(
  arr: number[],
  target: number,
): number | undefined {
  return undefined;
}

export = { linearSearch, binarySearch, binarySearchRecursive };
