// Test suite used by the AlgoCasts web practice page (problem "tent-packing").
// Cases 1-10 come from README.md; the rest add edge cases and greedy traps.
import { minTentPacking } from './index';

// When several optimal answers exist, check the rules instead of one exact array.
function verify(numPeople: number, tentSizes: number[], expectedCount: number) {
  const result = minTentPacking(numPeople, tentSizes);
  if (result === -1) return 'returned -1 but an exact fit exists';
  const problems: string[] = [];
  if (result.count !== expectedCount) problems.push(`count should be ${expectedCount}, got ${result.count}`);
  if (result.sizes.length !== result.count) problems.push('sizes.length must equal count');
  if (result.sizes.reduce((sum, size) => sum + size, 0) !== numPeople) problems.push('sizes must add up to numPeople');
  if (result.sizes.some(size => !tentSizes.includes(size))) problems.push('every size must come from tentSizes');
  if (result.sizes.some((size, i) => i > 0 && size > result.sizes[i - 1])) problems.push('sizes must be sorted from largest to smallest');
  return problems.length ? problems.join('; ') : 'ok';
}

test('Case 1: 10 คน, [2, 5, 6] → 2 เต็นท์ [5, 5]', () => {
  expect(minTentPacking(10, [2, 5, 6])).toEqual({ count: 2, sizes: [5, 5] });
});

test('Case 2: 9 คน, [5, 6] → -1 (จัดพอดีไม่ได้)', () => {
  expect(minTentPacking(9, [5, 6])).toBe(-1);
});

test('Case 3: 11 คน, [5, 6] → 2 เต็นท์ [6, 5]', () => {
  expect(minTentPacking(11, [5, 6])).toEqual({ count: 2, sizes: [6, 5] });
});

test('Case 4: tentSizes ไม่เรียงลำดับ 10 คน, [6, 2, 5] → [5, 5]', () => {
  expect(minTentPacking(10, [6, 2, 5])).toEqual({ count: 2, sizes: [5, 5] });
});

test('Case 5: tentSizes มีค่าซ้ำ 10 คน, [2, 5, 5, 5, 6, 6] → [5, 5]', () => {
  expect(minTentPacking(10, [2, 5, 5, 5, 6, 6])).toEqual({ count: 2, sizes: [5, 5] });
});

test('Case 6: ใบเดียวจบ 8 คน, [3, 5, 8] → [8]', () => {
  expect(minTentPacking(8, [3, 5, 8])).toEqual({ count: 1, sizes: [8] });
});

test('Case 7: หลายทางเลือก 8 คน, [2, 3, 5] → [5, 3]', () => {
  expect(minTentPacking(8, [2, 3, 5])).toEqual({ count: 2, sizes: [5, 3] });
});

test('Case 8: 1 คน, [2, 3, 4] → -1', () => {
  expect(minTentPacking(1, [2, 3, 4])).toBe(-1);
});

test('Case 9: มีเต็นท์ขนาด 1 4 คน, [1, 3, 5] → [3, 1]', () => {
  expect(minTentPacking(4, [1, 3, 5])).toEqual({ count: 2, sizes: [3, 1] });
});

test('Case 10: 14 คน, [4, 6, 8] → [8, 6]', () => {
  expect(minTentPacking(14, [4, 6, 8])).toEqual({ count: 2, sizes: [8, 6] });
});

test('ไม่มีพนักงานเลย 0 คน → { count: 0, sizes: [] }', () => {
  expect(minTentPacking(0, [2, 5])).toEqual({ count: 0, sizes: [] });
});

test('ไม่มีเต็นท์ให้ใช้ 5 คน, [] → -1', () => {
  expect(minTentPacking(5, [])).toBe(-1);
});

test('เต็นท์ใหญ่กว่าจำนวนคน 3 คน, [5, 3] → [3]', () => {
  expect(minTentPacking(3, [5, 3])).toEqual({ count: 1, sizes: [3] });
});

test('มีแต่เต็นท์ขนาดคู่ 7 คน, [2, 4] → -1', () => {
  expect(minTentPacking(7, [2, 4])).toBe(-1);
});

test('Greedy trap: 12 คน, [9, 6, 1] → 2 เต็นท์ (Greedy ได้ 9+1+1+1)', () => {
  expect(minTentPacking(12, [9, 6, 1])).toEqual({ count: 2, sizes: [6, 6] });
});

test('Greedy trap: 30 คน, [1, 10, 25] → 3 เต็นท์ (Greedy ได้ 25+1×5)', () => {
  expect(minTentPacking(30, [1, 10, 25])).toEqual({ count: 3, sizes: [10, 10, 10] });
});

test('ใช้ทุกขนาด 23 คน, [10, 7, 6] → [10, 7, 6]', () => {
  expect(minTentPacking(23, [10, 7, 6])).toEqual({ count: 3, sizes: [10, 7, 6] });
});

test('คำตอบที่ดีที่สุดมีหลายชุด 12 คน, [3, 4, 6, 8] → 2 เต็นท์ (8+4 หรือ 6+6 ก็ได้)', () => {
  expect(verify(12, [3, 4, 6, 8], 2)).toBe('ok');
});

test('จำนวนคนมาก 9973 คน, [7, 13, 29] → 345 เต็นท์ และรวมได้พอดี', () => {
  expect(verify(9973, [7, 13, 29], 345)).toBe('ok');
});
