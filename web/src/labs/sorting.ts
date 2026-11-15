// Sorting Lab: Bubble, Selection and Merge Sort, matching completed_exercises/sorting.
import { parseNumbers, randomInt, type Frame, type LabSpec } from './engine';

type SortAlgo = 'bubble' | 'selection' | 'merge';

type Mark = 'compare' | 'swap' | 'sorted' | 'min' | 'range' | 'write';
interface MergeView { left: number[]; right: number[]; results: number[]; depth: number }
interface SortFrame {
  arr: number[];
  marks: Record<number, Mark>;
  line: number;
  message: string;
  comparisons: number;
  writes: number;
  merge?: MergeView;
}

const algorithms: Record<SortAlgo, { name: string; complexity: string; code: string[] }> = {
  bubble: {
    name: 'Bubble Sort',
    complexity: 'O(n²) time · O(1) space',
    code: [
      'for (let i = 0; i < n; i++)',
      '  for (let j = 0; j < n - i - 1; j++)',
      '    if (arr[j] > arr[j + 1])',
      '      swap(arr, j, j + 1)',
      'return arr',
    ],
  },
  selection: {
    name: 'Selection Sort',
    complexity: 'O(n²) time · O(1) space',
    code: [
      'for (let i = 0; i < n; i++)',
      '  let indexOfMin = i',
      '  for (let j = i + 1; j < n; j++)',
      '    if (arr[j] < arr[indexOfMin])',
      '      indexOfMin = j',
      '  if (indexOfMin !== i)',
      '    swap(arr, i, indexOfMin)',
      'return arr',
    ],
  },
  merge: {
    name: 'Merge Sort',
    complexity: 'O(n log n) time · O(n) space',
    code: [
      'mergeSort(arr): if (arr.length === 1) return arr',
      '  const center = Math.floor(arr.length / 2)',
      '  return merge(mergeSort(left), mergeSort(right))',
      'merge(left, right): const results = []',
      '  while (left.length && right.length)',
      '    if (left[0] < right[0]) results.push(left.shift())',
      '    else results.push(right.shift())',
      '  return [...results, ...left, ...right]',
    ],
  },
};

const list = (values: number[]) => `[${values.join(', ')}]`;

function bubbleFrames(input: number[]): SortFrame[] {
  const arr = [...input], frames: SortFrame[] = [], sorted = new Set<number>();
  let comparisons = 0, writes = 0;
  const push = (line: number, message: string, marks: Record<number, Mark> = {}) => {
    const all: Record<number, Mark> = {};
    sorted.forEach(i => (all[i] = 'sorted'));
    frames.push({ arr: [...arr], marks: { ...all, ...marks }, line, message, comparisons, writes });
  };
  push(-1, `เริ่มต้น ${list(arr)} กด ▶ เพื่อดูทีละขั้น`);
  for (let i = 0; i < arr.length; i++) {
    push(0, `รอบที่ ${i + 1}: ไล่เทียบคู่ติดกันตั้งแต่ index 0 ถึง ${arr.length - i - 1}`);
    for (let j = 0; j < arr.length - i - 1; j++) {
      comparisons++;
      const bigger = arr[j] > arr[j + 1];
      push(2, `เทียบ ${arr[j]} กับ ${arr[j + 1]} → ${bigger ? `${arr[j]} มากกว่า ต้องสลับ` : 'ลำดับถูกแล้ว ไม่ต้องสลับ'}`, { [j]: 'compare', [j + 1]: 'compare' });
      if (bigger) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        writes++;
        push(3, `สลับแล้ว: ${arr[j]} มาอยู่ index ${j}, ${arr[j + 1]} ไป index ${j + 1}`, { [j]: 'swap', [j + 1]: 'swap' });
      }
    }
    sorted.add(arr.length - i - 1);
    push(1, `จบรอบที่ ${i + 1}: ${arr[arr.length - i - 1]} ลอยไปอยู่ตำแหน่งสุดท้ายที่ยังไม่เรียง`);
  }
  push(4, `เรียงเสร็จ ${list(arr)} · เทียบ ${comparisons} ครั้ง สลับ ${writes} ครั้ง`);
  return frames;
}

function selectionFrames(input: number[]): SortFrame[] {
  const arr = [...input], frames: SortFrame[] = [], sorted = new Set<number>();
  let comparisons = 0, writes = 0;
  const push = (line: number, message: string, marks: Record<number, Mark> = {}) => {
    const all: Record<number, Mark> = {};
    sorted.forEach(i => (all[i] = 'sorted'));
    frames.push({ arr: [...arr], marks: { ...all, ...marks }, line, message, comparisons, writes });
  };
  push(-1, `เริ่มต้น ${list(arr)} กด ▶ เพื่อดูทีละขั้น`);
  for (let i = 0; i < arr.length; i++) {
    let indexOfMin = i;
    push(1, `i = ${i}: สมมติว่า ${arr[i]} (index ${i}) น้อยที่สุด → indexOfMin = ${i}`, { [i]: 'min' });
    for (let j = i + 1; j < arr.length; j++) {
      comparisons++;
      const lower = arr[j] < arr[indexOfMin];
      push(3, `เทียบ ${arr[j]} (j = ${j}) กับค่าน้อยสุดตอนนี้ ${arr[indexOfMin]} → ${lower ? 'น้อยกว่า' : 'ไม่น้อยกว่า'}`, { [indexOfMin]: 'min', [j]: 'compare' });
      if (lower) {
        indexOfMin = j;
        push(4, `จำ index ใหม่: indexOfMin = ${j} (ค่า ${arr[j]})`, { [indexOfMin]: 'min' });
      }
    }
    if (indexOfMin !== i) {
      [arr[i], arr[indexOfMin]] = [arr[indexOfMin], arr[i]];
      writes++;
      push(6, `indexOfMin (${indexOfMin}) ≠ i (${i}) → สลับ ${arr[i]} มาไว้ index ${i}`, { [i]: 'swap', [indexOfMin]: 'swap' });
    } else {
      push(5, `indexOfMin = i อยู่แล้ว ไม่ต้องสลับ`, { [i]: 'min' });
    }
    sorted.add(i);
  }
  push(7, `เรียงเสร็จ ${list(arr)} · เทียบ ${comparisons} ครั้ง สลับ ${writes} ครั้ง`);
  return frames;
}

function mergeFrames(input: number[]): SortFrame[] {
  const arr = [...input], frames: SortFrame[] = [];
  let comparisons = 0, writes = 0;
  const push = (line: number, message: string, lo: number, hi: number, marks: Record<number, Mark> = {}, merge?: MergeView) => {
    const all: Record<number, Mark> = {};
    for (let k = lo; k < hi; k++) all[k] = 'range';
    frames.push({ arr: [...arr], marks: { ...all, ...marks }, line, message, comparisons, writes, merge });
  };
  push(-1, `เริ่มต้น ${list(arr)} กด ▶ เพื่อดูทีละขั้น`, 0, 0);
  const sort = (lo: number, hi: number, depth: number) => {
    const part = arr.slice(lo, hi);
    if (hi - lo <= 1) {
      push(0, `${list(part)} ยาว 1 ตัว → เรียงแล้ว return ทันที (base case)`, lo, hi);
      return;
    }
    const center = lo + Math.floor((hi - lo) / 2);
    push(1, `ชั้นที่ ${depth}: แบ่ง ${list(part)} เป็น ${list(arr.slice(lo, center))} กับ ${list(arr.slice(center, hi))}`, lo, hi);
    sort(lo, center, depth + 1);
    sort(center, hi, depth + 1);
    const left = arr.slice(lo, center), right = arr.slice(center, hi), results: number[] = [];
    const view = () => ({ left: [...left], right: [...right], results: [...results], depth });
    push(3, `merge ${list(left)} กับ ${list(right)} → เริ่มจาก results = []`, lo, hi, {}, view());
    while (left.length && right.length) {
      comparisons++;
      const takeLeft = left[0] < right[0];
      push(5, `เทียบตัวแรก ${left[0]} (ซ้าย) กับ ${right[0]} (ขวา) → ${takeLeft ? 'ซ้ายน้อยกว่า' : 'ขวาน้อยกว่าหรือเท่ากัน'}`, lo, hi, {}, view());
      const value = takeLeft ? left.shift()! : right.shift()!;
      results.push(value);
      push(takeLeft ? 5 : 6, `shift ${value} จากฝั่ง${takeLeft ? 'ซ้าย' : 'ขวา'}เข้า results`, lo, hi, {}, view());
    }
    const rest = [...left, ...right];
    results.push(...rest);
    left.length = 0; right.length = 0;
    for (let k = 0; k < results.length; k++) { arr[lo + k] = results[k]; writes++; }
    const written: Record<number, Mark> = {};
    for (let k = lo; k < hi; k++) written[k] = 'write';
    push(7, `${rest.length ? `ต่อที่เหลือ ${list(rest)} ท้าย results → ` : ''}ได้ ${list(results)} ส่งกลับไปให้ชั้นบน`, lo, hi, written, view());
  };
  sort(0, arr.length, 1);
  const done: Record<number, Mark> = {};
  arr.forEach((_, k) => (done[k] = 'sorted'));
  frames.push({ arr: [...arr], marks: done, line: 2, message: `เรียงเสร็จ ${list(arr)} · เทียบ ${comparisons} ครั้ง เขียนค่า ${writes} ครั้ง`, comparisons, writes });
  return frames;
}

const builders: Record<SortAlgo, (input: number[]) => SortFrame[]> = { bubble: bubbleFrames, selection: selectionFrames, merge: mergeFrames };

function render(frame: SortFrame, values: number[], algo: SortAlgo): Frame {
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const bars = frame.arr.map((v, i) => `<div class="sort-bar ${frame.marks[i] ? `is-${frame.marks[i]}` : ''}"><span class="sort-fill" style="height:${14 + ((v - min) / span) * 86}%"></span><b>${v}</b><small>${i}</small></div>`).join('');
  let merge = '';
  if (frame.merge) {
    const row = (label: string, items: number[], cls: string) => `<div class="merge-row ${cls}"><span>${label}</span><div>${items.length ? items.map((v, i) => `<i class="${i === 0 && cls !== 'is-results' ? 'head' : ''}">${v}</i>`).join('') : '<em>ว่าง</em>'}</div></div>`;
    merge = `<div class="sort-merge">${row('left', frame.merge.left, 'left')}${row('right', frame.merge.right, 'right')}${row('results', frame.merge.results, 'is-results')}</div>`;
  }
  return {
    html: `<div class="sort-stage" style="--count:${frame.arr.length}" aria-hidden="true">${bars}</div>${merge}`,
    message: frame.message,
    line: frame.line,
    stats: [['เทียบ', `${frame.comparisons} ครั้ง`], [algo === 'merge' ? 'เขียนค่า' : 'สลับ', `${frame.writes} ครั้ง`]],
  };
}

const presets = ['97, 0, 22, -30, 10, 5', '5, 4, 3, 2, 1', '1, 2, 3, 4, 5', '3, 1, 3, 2, 1, 2'];
const random = () => Array.from({ length: randomInt(6, 8) }, () => randomInt(-50, 148)).join(', ');

export const sortingLab: LabSpec = {
  id: 'sorting',
  title: 'Sorting Lab',
  description: 'เลือก algorithm แล้วกด ▶ หรือเดินทีละขั้น เพื่อดูว่าแต่ละบรรทัดของโค้ดทำอะไรกับอาร์เรย์',
  legend: [['k-compare', 'กำลังเทียบ', ['bubble', 'selection']], ['k-swap', 'สลับ', ['bubble', 'selection']], ['k-min', 'indexOfMin', ['selection']], ['k-range', 'ช่วงที่กำลังทำ', ['merge']], ['k-write', 'เขียนผล merge', ['merge']], ['k-sorted', 'เรียงแล้ว']],
  modes: (Object.keys(algorithms) as SortAlgo[]).map(id => ({
    id,
    label: algorithms[id].name,
    code: algorithms[id].code,
    complexity: algorithms[id].complexity.replace(' time · ', ' เวลา · ').replace(' space', ' หน่วยความจำ'),
    input: { label: 'อาร์เรย์', value: presets[0], presets, random },
    build(text: string) {
      const values = parseNumbers(text);
      if (typeof values === 'string') return values;
      return builders[id](values).map(frame => render(frame, values, id));
    },
  })),
};
