// Group 04 "Big O & Fibonacci": how work grows with n, and the fib call tree with and without memoization.
import { parseInteger, treeHtml, type Frame, type LabSpec, type TreeNode } from './engine';

const classes: [string, (n: number) => number][] = [
  ['O(1)', () => 1],
  ['O(log n)', n => Math.max(1, Math.ceil(Math.log2(n)))],
  ['O(n)', n => n],
  ['O(n log n)', n => Math.max(1, Math.ceil(n * Math.log2(n)))],
  ['O(n²)', n => n * n],
  ['O(2ⁿ)', n => 2 ** n],
];

function growth(text: string): Frame[] | string {
  const max = parseInteger(text, 2, 40);
  if (typeof max === 'string') return max;
  const sizes: number[] = [];
  for (let n = 1; n <= max; n *= 2) sizes.push(n);
  if (sizes.at(-1) !== max) sizes.push(max);
  const top = Math.log10(2 ** max + 1);
  return sizes.map((n, k) => {
    const prev = sizes[k - 1];
    const rows = classes.map(([name, f], i) => {
      const ops = f(n), ratio = prev ? ops / f(prev) : 1;
      const width = Math.max(1.5, (Math.log10(ops + 1) / top) * 100);
      return `<div class="growth-row tone-${i}"><span>${name}</span><div><i style="width:${width}%"></i></div><b>${ops.toLocaleString('en-US')}</b><small>${prev ? `×${ratio >= 100 ? Math.round(ratio).toLocaleString('en-US') : +ratio.toFixed(1)}` : ''}</small></div>`;
    }).join('');
    const message = !prev ? `n = ${n}: ทุกแบบยังทำงานน้อยพอกัน ความต่างจะโผล่เมื่อ n โตขึ้น`
      : `n เพิ่มจาก ${prev} เป็น ${n}: O(n) งานเพิ่ม ${+(n / prev).toFixed(1)} เท่า, O(n²) เพิ่ม ${+((n * n) / (prev * prev)).toFixed(1)} เท่า, O(2ⁿ) เพิ่ม ${(2 ** (n - prev)).toLocaleString('en-US')} เท่า`;
    return { html: `<div class="growth"><p class="lab-note">จำนวนงานโดยประมาณเมื่อ n = <strong>${n}</strong> (แถบใช้สเกล log)</p>${rows}</div>`, message, line: -1 };
  });
}

interface Call { n: number; value?: number; state: 'active' | 'done' | 'cached' | 'waiting'; children: Call[] }

function fibTree(text: string, memo: boolean): Frame[] | string {
  const n = parseInteger(text, 1, memo ? 12 : 6);
  if (typeof n === 'string') return n;
  const frames: Frame[] = [], cache = new Map<number, number>();
  let calls = 0, hits = 0, root: Call | null = null;
  const toTree = (c: Call): TreeNode => ({ label: `fib(${c.n})${c.value !== undefined ? `<small>= ${c.value}</small>` : ''}`, cls: `is-${c.state}`, children: c.children.map(toTree) });
  const push = (message: string, line: number) => frames.push({
    html: `<div class="tree-scroll">${root ? treeHtml(toTree(root)) : ''}</div>${memo ? `<p class="lab-note">cache = { ${[...cache].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}: ${v}`).join(', ')} }</p>` : ''}`,
    message, line, stats: [['เรียกฟังก์ชัน', `${calls} ครั้ง`], ...(memo ? [['ใช้ cache', `${hits} ครั้ง`] as [string, string]] : [])],
  });
  const call = (k: number, parent: Call | null): number => {
    const node: Call = { n: k, state: 'active', children: [] };
    if (parent) { parent.children.push(node); parent.state = 'waiting'; } else root = node;
    calls++;
    if (memo && cache.has(k)) {
      hits++; node.value = cache.get(k)!; node.state = 'cached';
      push(`fib(${k}) เคยคำนวณแล้ว → หยิบ ${node.value} จาก cache ไม่ต้องเรียกต่อ`, 3);
      if (parent) parent.state = 'active';
      return node.value;
    }
    push(`เรียก fib(${k})`, memo ? 1 : 0);
    let value: number;
    if (k < 2) {
      value = k;
      node.value = value; node.state = 'done';
      push(`fib(${k}): n < 2 เป็น base case คืน ${k} ทันที`, memo ? 4 : 1);
    } else {
      const a = call(k - 1, node);
      node.state = 'active';
      const b = call(k - 2, node);
      node.state = 'active';
      value = a + b;
      node.value = value; node.state = 'done';
      push(`fib(${k}) = fib(${k - 1}) + fib(${k - 2}) = ${a} + ${b} = ${value}`, memo ? 4 : 2);
    }
    if (memo) { cache.set(k, value); push(`เก็บ cache[${k}] = ${value}`, 5); }
    if (parent) parent.state = 'active';
    return value;
  };
  const result = call(n, null);
  push(memo
    ? `fib(${n}) = ${result} · เรียกแค่ ${calls} ครั้ง (ใช้ cache ${hits} ครั้ง) เพราะแต่ละ n คำนวณครั้งเดียว จึงเหลือ O(n)`
    : `fib(${n}) = ${result} · เรียกทั้งหมด ${calls} ครั้ง เพราะคำนวณค่าเดิมซ้ำหลายรอบ งานโตเกือบเท่าตัวทุกครั้งที่ n เพิ่ม 1 → O(2ⁿ)`, memo ? 6 : 2);
  return frames;
}

export const bigoLab: LabSpec = {
  id: 'bigo',
  title: 'Big O Lab',
  description: 'ดูว่าแต่ละ Big O โตเร็วแค่ไหนเมื่อ n เพิ่ม และเทียบ call tree ของ fib แบบ recursion ธรรมดากับแบบ memoize',
  legend: [['k-range', 'กำลังทำงาน', ['fib', 'memo']], ['k-compare', 'รอผลจาก call ลูก', ['fib', 'memo']], ['k-sorted', 'คืนค่าแล้ว', ['fib', 'memo']], ['k-min', 'ได้จาก cache', ['memo']]],
  modes: [
    {
      id: 'growth', label: 'Big O โตแค่ไหน',
      code: ['O(1)       arr[0]', 'O(log n)   binary search ใน array ที่เรียงแล้ว', 'O(n)       for (const item of arr)', 'O(n log n) arr.sort((a, b) => a - b)', 'O(n²)      loop ซ้อนบน array เดียวกัน', 'O(2ⁿ)      fib(n) แบบ recursion ธรรมดา'],
      input: { label: 'n สูงสุด', value: '32', presets: ['16', '32', '40'], hint: 'จะเพิ่ม n ทีละ 2 เท่าจนถึงค่านี้ (2–40)' }, build: growth,
    },
    {
      id: 'fib', label: 'fib แบบ recursion', complexity: 'O(2ⁿ)',
      code: ['function fib(n) {', '  if (n < 2) return n;', '  return fib(n - 1) + fib(n - 2);', '}'],
      input: { label: 'n', value: '5', presets: ['4', '5', '6'], hint: '1–6 (มากกว่านี้ต้นไม้ใหญ่เกินจอ)' }, build: text => fibTree(text, false),
    },
    {
      id: 'memo', label: 'fib แบบ memoize', complexity: 'O(n)',
      code: ['const cache = {};', 'function fib(n) {', '  // ทุก call ผ่าน memoize', '  if (cache[n] !== undefined) return cache[n];', '  const result = n < 2 ? n : fib(n - 1) + fib(n - 2);', '  cache[n] = result;', '  return result;', '}'],
      input: { label: 'n', value: '6', presets: ['5', '6', '10'], hint: '1–12' }, build: text => fibTree(text, true),
    },
  ],
};
