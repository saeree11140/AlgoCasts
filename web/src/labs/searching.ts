// Group 11 "Searching": linear search, binary search, lower bound and search in a rotated array,
// matching completed_exercises/search, searchrange and rotatedsearch.
import { esc, parseInteger, parseNumbers, randomInt, type Frame, type LabSpec } from './engine';

type Mark = 'range' | 'mid' | 'out' | 'found' | 'sorted' | '';
type Tag = [label: string, cls: string];

interface Query { values: number[]; target: number }

const markClass: Record<Mark, string> = { range: 'is-range', mid: 'is-compare', out: 'is-muted', found: 'is-done', sorted: 'is-new', '': '' };

/** Cells with pointer tags under each index. `end` adds a phantom slot at index n for half-open ranges. */
function stage(values: number[], target: number, marks: (i: number) => Mark, tags: Record<number, Tag[]>, end = false): string {
  const slot = (label: string, i: number, cls: string) => `<div class="search-col"><div class="cell ${cls}"><b>${label}</b><small>${i}</small></div><div class="search-tags">${(tags[i] ?? []).map(([text, tagCls]) => `<span class="ptr ${tagCls}">${esc(text)}</span>`).join('')}</div></div>`;
  const cells = values.map((v, i) => slot(esc(v), i, markClass[marks(i)])).join('') + (end ? slot('·', values.length, 'is-marker') : '');
  return `<div class="lab-row"><span class="lab-row-label">target</span><code class="lab-string">${esc(target)}</code></div><div class="search-row" aria-hidden="true">${cells}</div>`;
}

const addTag = (tags: Record<number, Tag[]>, index: number, tag: Tag) => { (tags[index] ??= []).push(tag); return tags; };
const pointers = (left: number, mid: number | undefined, right: number, rightLabel = 'right') => {
  const tags: Record<number, Tag[]> = {};
  addTag(tags, left, ['left', '']);
  if (mid !== undefined) addTag(tags, mid, ['mid', 'is-compare']);
  addTag(tags, right, [rightLabel, '']);
  return tags;
};
const list = (values: number[]) => `[${values.join(', ')}]`;

function parseQuery(text: string): Query | string {
  const parts = text.split('|');
  if (parts.length !== 2) return 'ใส่ในรูปแบบ "อาร์เรย์ | ค่าที่หา" เช่น 1, 3, 5, 7 | 5';
  const values = parseNumbers(parts[0], 1, 14, -99, 999);
  if (typeof values === 'string') return values;
  const target = parseInteger(parts[1], -99, 999);
  if (typeof target === 'string') return `ค่าที่หา: ${target}`;
  return { values, target };
}

const isSorted = (values: number[]) => values.every((v, i) => i === 0 || values[i - 1] <= v);

function linear(text: string): Frame[] | string {
  const query = parseQuery(text); if (typeof query === 'string') return query;
  const { values, target } = query;
  const frames: Frame[] = [{ html: stage(values, target, () => '', {}), message: `หา ${target} ใน ${list(values)} โดยเริ่มจาก index 0`, line: 0 }];
  for (let i = 0; i < values.length; i++) {
    const found = values[i] === target;
    const stats: Frame['stats'] = [['เทียบ', `${i + 1} ครั้ง`]];
    frames.push({ html: stage(values, target, k => (k < i ? 'out' : k === i ? (found ? 'found' : 'mid') : ''), { [i]: [['i', found ? 'is-done' : 'is-compare']] }), message: found ? `arr[${i}] = ${values[i]} เท่ากับ ${target} → คืน index ${i}` : `arr[${i}] = ${values[i]} ≠ ${target} ไปตัวถัดไป`, line: 1, stats });
    if (found) {
      frames.push({ html: stage(values, target, k => (k < i ? 'out' : k === i ? 'found' : ''), { [i]: [['i', 'is-done']] }), message: `เจอที่ index ${i} หลังเทียบ ${i + 1} ครั้ง ตัวที่เหลือไม่ต้องดู`, line: 1, stats });
      return frames;
    }
  }
  frames.push({ html: stage(values, target, () => 'out', {}), message: `ดูครบทั้ง ${values.length} ตัวแล้วไม่เจอ ${target} → คืน -1 (กรณีแย่ที่สุดของ O(n))`, line: 2, stats: [['เทียบ', `${values.length} ครั้ง`]] });
  return frames;
}

function binary(text: string): Frame[] | string {
  const query = parseQuery(text); if (typeof query === 'string') return query;
  const { values, target } = query;
  if (!isSorted(values)) return 'Binary search ใช้ได้กับ array ที่เรียงจากน้อยไปมากเท่านั้น ลองกด "สุ่ม" หรือเรียงค่าก่อน';
  let left = 0, right = values.length - 1, rounds = 0;
  const range = (mid?: number) => (k: number): Mark => (k < left || k > right ? 'out' : k === mid ? 'mid' : 'range');
  const linearCost = values.includes(target) ? values.indexOf(target) + 1 : values.length;
  const stats = (): Frame['stats'] => [['รอบ', rounds], ['เทียบ', `${rounds} ครั้ง`], ['linear search ใช้', `${linearCost} ครั้ง`]];
  const frames: Frame[] = [{ html: stage(values, target, range(), pointers(left, undefined, right)), message: `เริ่มด้วยช่วงทั้ง array: left = 0, right = ${right}`, line: 0, stats: stats() }];
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    rounds++;
    frames.push({ html: stage(values, target, range(mid), pointers(left, mid, right)), message: `รอบ ${rounds}: mid = ${left} + floor((${right} - ${left}) / 2) = ${mid} → arr[${mid}] = ${values[mid]}`, line: 2, stats: stats() });
    if (values[mid] === target) {
      frames.push({ html: stage(values, target, k => (k === mid ? 'found' : k < left || k > right ? 'out' : 'range'), { [mid]: [['mid', 'is-done']] }), message: `arr[${mid}] = ${values[mid]} === ${target} → คืน index ${mid} (ตำแหน่ง ไม่ใช่ค่า) ใช้ ${rounds} รอบ`, line: 3, stats: stats() });
      return frames;
    }
    if (values[mid] < target) {
      frames.push({ html: stage(values, target, range(mid), pointers(left, mid, right)), message: `${values[mid]} < ${target} → ค่าที่ index ${left}–${mid} น้อยเกินไปทั้งหมด ทิ้งซ้าย: left = ${mid + 1}`, line: 4, stats: stats() });
      left = mid + 1;
    } else {
      frames.push({ html: stage(values, target, range(mid), pointers(left, mid, right)), message: `${values[mid]} > ${target} → ค่าที่ index ${mid}–${right} มากเกินไปทั้งหมด ทิ้งขวา: right = ${mid - 1}`, line: 5, stats: stats() });
      right = mid - 1;
    }
  }
  const tags: Record<number, Tag[]> = {};
  if (left < values.length) addTag(tags, left, ['left', '']);
  if (right >= 0) addTag(tags, right, ['right', '']);
  frames.push({ html: stage(values, target, () => 'out', tags), message: `left (${left}) > right (${right}) ช่วงว่างแล้ว → ไม่มี ${target} คืน -1`, line: 6, stats: stats() });
  return frames;
}

function lowerBound(text: string): Frame[] | string {
  const query = parseQuery(text); if (typeof query === 'string') return query;
  const { values, target } = query;
  if (!isSorted(values)) return 'Lower bound ใช้กับ array ที่เรียงจากน้อยไปมาก (มีค่าซ้ำได้) ลองกด "สุ่ม"';
  let left = 0, right = values.length, rounds = 0;
  const range = (mid?: number) => (k: number): Mark => (k < left || k >= right ? 'out' : k === mid ? 'mid' : 'range');
  const frames: Frame[] = [{ html: stage(values, target, range(), pointers(left, undefined, right), true), message: `หา index แรกที่ค่า ≥ ${target} ช่วงครึ่งเปิด [left, right) = [0, ${right}) right ชี้เลยท้าย array`, line: 0, stats: [['รอบ', 0]] }];
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    rounds++;
    frames.push({ html: stage(values, target, range(mid), pointers(left, mid, right), true), message: `รอบ ${rounds}: mid = ${mid} → nums[${mid}] = ${values[mid]}`, line: 2, stats: [['รอบ', rounds]] });
    if (values[mid] < target) {
      frames.push({ html: stage(values, target, range(mid), pointers(left, mid, right), true), message: `${values[mid]} < ${target} → mid ไม่ใช่คำตอบแน่นอน left = ${mid + 1}`, line: 3, stats: [['รอบ', rounds]] });
      left = mid + 1;
    } else {
      frames.push({ html: stage(values, target, range(mid), pointers(left, mid, right), true), message: `${values[mid]} ≥ ${target} → mid อาจเป็นคำตอบ จึงเก็บไว้: right = ${mid} (ไม่ใช่ mid - 1)`, line: 4, stats: [['รอบ', rounds]] });
      right = mid;
    }
  }
  const found = left < values.length && values[left] === target;
  const message = found
    ? `left === right === ${left} → ตำแหน่งแรกของ ${target} คือ index ${left}`
    : left === values.length
      ? `ได้ ${left} (= length) → ทุกค่าน้อยกว่า ${target} ถ้าจะแทรก ${target} ให้ต่อท้าย`
      : `ได้ ${left} แต่ nums[${left}] = ${values[left]} ไม่ใช่ ${target} → ไม่มี ${target} ถ้าจะแทรกให้แทรกที่ index ${left}`;
  frames.push({ html: stage(values, target, k => (k === left ? (found ? 'found' : 'mid') : 'out'), { [left]: [['answer', found ? 'is-done' : 'is-compare']] }, true), message, line: 5, stats: [['รอบ', rounds]] });
  return frames;
}

function rotated(text: string): Frame[] | string {
  const query = parseQuery(text); if (typeof query === 'string') return query;
  const { values, target } = query;
  const drops = values.filter((v, i) => i > 0 && values[i - 1] > v).length;
  if (new Set(values).size !== values.length) return 'ใช้ค่าที่ไม่ซ้ำกัน';
  if (drops > 1 || (drops === 1 && values[values.length - 1] > values[0])) return 'ต้องเป็น array ที่เรียงแล้วถูกหมุน เช่น 4, 5, 6, 7, 0, 1, 2';
  let left = 0, right = values.length - 1, rounds = 0;
  const frames: Frame[] = [];
  const view = (mid: number | undefined, sortedFrom?: number, sortedTo?: number) => (k: number): Mark =>
    k < left || k > right ? 'out' : k === mid ? 'mid' : sortedFrom !== undefined && k >= sortedFrom && k <= sortedTo! ? 'sorted' : 'range';
  frames.push({ html: stage(values, target, view(undefined), pointers(left, undefined, right)), message: `array ถูกหมุนมา แต่ทุกครั้งที่แบ่งครึ่ง จะมีครึ่งหนึ่งที่ยังเรียงอยู่เสมอ`, line: 0, stats: [['รอบ', 0]] });
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    rounds++;
    const stats: Frame['stats'] = [['รอบ', rounds]];
    frames.push({ html: stage(values, target, view(mid), pointers(left, mid, right)), message: `รอบ ${rounds}: mid = ${mid} → nums[${mid}] = ${values[mid]}`, line: 1, stats });
    if (values[mid] === target) {
      frames.push({ html: stage(values, target, k => (k === mid ? 'found' : k < left || k > right ? 'out' : 'range'), { [mid]: [['mid', 'is-done']] }), message: `nums[${mid}] = ${values[mid]} === ${target} → คืน index ${mid}`, line: 2, stats });
      return frames;
    }
    if (values[left] <= values[mid]) {
      const inside = values[left] <= target && target < values[mid];
      frames.push({ html: stage(values, target, view(mid, left, mid - 1), pointers(left, mid, right)), message: `nums[left] = ${values[left]} ≤ nums[mid] = ${values[mid]} → ครึ่งซ้ายเรียงอยู่ (${values[left]} ถึง ${values[mid]})`, line: 3, stats });
      frames.push({ html: stage(values, target, view(mid, left, mid - 1), pointers(left, mid, right)), message: inside ? `${target} อยู่ในช่วง [${values[left]}, ${values[mid]}) → ไปซ้าย right = ${mid - 1}` : `${target} ไม่อยู่ในช่วง [${values[left]}, ${values[mid]}) → ไปขวา left = ${mid + 1}`, line: inside ? 4 : 5, stats });
      if (inside) right = mid - 1; else left = mid + 1;
    } else {
      const inside = values[mid] < target && target <= values[right];
      frames.push({ html: stage(values, target, view(mid, mid + 1, right), pointers(left, mid, right)), message: `nums[left] = ${values[left]} > nums[mid] = ${values[mid]} → ครึ่งซ้ายมีจุดหัก ครึ่งขวาจึงเรียงอยู่ (${values[mid]} ถึง ${values[right]})`, line: 6, stats });
      frames.push({ html: stage(values, target, view(mid, mid + 1, right), pointers(left, mid, right)), message: inside ? `${target} อยู่ในช่วง (${values[mid]}, ${values[right]}] → ไปขวา left = ${mid + 1}` : `${target} ไม่อยู่ในช่วง (${values[mid]}, ${values[right]}] → ไปซ้าย right = ${mid - 1}`, line: inside ? 7 : 8, stats });
      if (inside) left = mid + 1; else right = mid - 1;
    }
  }
  frames.push({ html: stage(values, target, () => 'out', {}), message: `ช่วงว่างแล้ว → ไม่มี ${target} คืน -1`, line: 9, stats: [['รอบ', rounds]] });
  return frames;
}

const sortedUnique = (count: number) => {
  const set = new Set<number>();
  while (set.size < count) set.add(randomInt(1, 60));
  return [...set].sort((a, b) => a - b);
};
const pickTarget = (values: number[]) => (Math.random() < 0.75 ? values[randomInt(0, values.length - 1)] : randomInt(1, 60));
const query = (values: number[], target: number) => `${values.join(', ')} | ${target}`;

export const searchingLab: LabSpec = {
  id: 'searching',
  title: 'Search Lab',
  description: 'ใส่อาร์เรย์และค่าที่ต้องการหา คั่นด้วย | แล้วกด ▶ เพื่อดูว่าแต่ละวิธีตัดช่วงค้นหาอย่างไร และต้องเทียบกี่ครั้ง',
  legend: [['k-range', 'ช่วงที่ยังเป็นไปได้', ['binary', 'lower', 'rotated']], ['k-compare', 'ตัวที่กำลังเทียบ'], ['k-write', 'ครึ่งที่ยังเรียงอยู่', ['rotated']], ['k-muted', 'ตัดทิ้ง / ดูแล้ว'], ['k-sorted', 'เจอแล้ว']],
  modes: [
    {
      id: 'linear', label: 'Linear Search', complexity: 'O(n) เวลา · O(1) หน่วยความจำ',
      code: ['for (let i = 0; i < arr.length; i++)', '  if (arr[i] === target) return i', 'return -1'],
      input: { label: 'อาร์เรย์ | ค่าที่หา', value: '7, 3, 9, 4, 8, 1 | 4', hint: 'ไม่ต้องเรียงก่อน', presets: ['7, 3, 9, 4, 8, 1 | 4', '7, 3, 9, 4, 8, 1 | 5', '2, 6, 6, 1, 6 | 6'], random: () => { const values = Array.from({ length: randomInt(6, 10) }, () => randomInt(1, 40)); return query(values, pickTarget(values)); } },
      build: linear,
    },
    {
      id: 'binary', label: 'Binary Search', complexity: 'O(log n) เวลา · O(1) หน่วยความจำ',
      code: ['let left = 0, right = arr.length - 1', 'while (left <= right)', '  const mid = left + Math.floor((right - left) / 2)', '  if (arr[mid] === target) return mid', '  if (arr[mid] < target) left = mid + 1', '  else right = mid - 1', 'return -1'],
      input: { label: 'อาร์เรย์ที่เรียงแล้ว | ค่าที่หา', value: '1, 3, 5, 7, 9, 11, 13, 15, 17 | 15', hint: 'ต้องเรียงจากน้อยไปมาก', presets: ['1, 3, 5, 7, 9, 11, 13, 15, 17 | 15', '1, 3, 5, 7, 9, 11, 13, 15, 17 | 4', '2, 4, 8, 16, 23, 42, 57, 60, 71, 88, 91, 99, 120, 150 | 23'], random: () => { const values = sortedUnique(randomInt(9, 14)); return query(values, pickTarget(values)); } },
      build: binary,
    },
    {
      id: 'lower', label: 'Lower Bound', complexity: 'O(log n) เวลา · O(1) หน่วยความจำ',
      code: ['let left = 0, right = nums.length', 'while (left < right)', '  const mid = left + Math.floor((right - left) / 2)', '  if (nums[mid] < target) left = mid + 1', '  else right = mid', 'return left'],
      input: { label: 'อาร์เรย์ที่เรียงแล้ว | ค่าที่หา', value: '1, 2, 2, 2, 5, 7 | 2', hint: 'มีค่าซ้ำได้ · ช่องสุดท้าย · คือตำแหน่ง length', presets: ['1, 2, 2, 2, 5, 7 | 2', '1, 3, 5, 6 | 4', '1, 3, 5, 6 | 9'], random: () => { const values = Array.from({ length: randomInt(7, 12) }, () => randomInt(1, 12)).sort((a, b) => a - b); return query(values, pickTarget(values)); } },
      build: lowerBound,
    },
    {
      id: 'rotated', label: 'Rotated Array', complexity: 'O(log n) เวลา · O(1) หน่วยความจำ',
      code: ['while (left <= right)', '  const mid = left + Math.floor((right - left) / 2)', '  if (nums[mid] === target) return mid', '  if (nums[left] <= nums[mid])          // ซ้ายเรียง', '    if (nums[left] <= target && target < nums[mid]) right = mid - 1', '    else left = mid + 1', '  else                                 // ขวาเรียง', '    if (nums[mid] < target && target <= nums[right]) left = mid + 1', '    else right = mid - 1', 'return -1'],
      input: { label: 'อาร์เรย์ที่ถูกหมุน | ค่าที่หา', value: '4, 5, 6, 7, 0, 1, 2 | 0', hint: 'ค่าไม่ซ้ำ เช่น 4, 5, 6, 7, 0, 1, 2', presets: ['4, 5, 6, 7, 0, 1, 2 | 0', '4, 5, 6, 7, 0, 1, 2 | 3', '15, 18, 22, 3, 5, 8, 11 | 18'], random: () => { const values = sortedUnique(randomInt(7, 11)); const shift = randomInt(1, values.length - 1); const turned = [...values.slice(shift), ...values.slice(0, shift)]; return query(turned, pickTarget(turned)); } },
      build: rotated,
    },
  ],
};
