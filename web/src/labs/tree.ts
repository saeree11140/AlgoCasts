// Group 08 "Tree & BST": traversal order on the course's sample tree, levelWidth, and BST insert/contains.
import { parseInteger, parseNumbers, treeHtml, type Frame, type LabSpec, type TreeNode } from './engine';

interface T { id: number; data: number; children: T[] }
let nextId = 0;
const t = (data: number, children: T[] = []): T => ({ id: nextId++, data, children });
/** The tree drawn in diagrams 08-01 … 08-11. */
const sample = () => { nextId = 0; return t(20, [t(0, [t(12), t(-2), t(1)]), t(40), t(-15, [t(-2)])]); };

const draw = (root: T, state: Map<number, string>) => {
  const conv = (n: T): TreeNode => ({ label: String(n.data), cls: state.get(n.id), children: n.children.map(conv) });
  return `<div class="tree-scroll">${treeHtml(conv(root))}</div>`;
};
const queueRow = (label: string, items: (T | 's')[]) => `<div class="lab-row"><span class="lab-row-label">${label}</span><div class="cells">${items.length ? items.map(x => `<div class="cell ${x === 's' ? 'is-marker' : 'is-compare'}"><b>${x === 's' ? "'s'" : x.data}</b></div>`).join('') : '<em>[ ]</em>'}</div></div>`;
const outRow = (out: number[]) => `<div class="lab-row"><span class="lab-row-label">fn(node)</span><code class="lab-string">${out.join(', ') || '—'}</code></div>`;

function traverse(depthFirst: boolean): Frame[] {
  const root = sample(), state = new Map<number, string>(), out: number[] = [], frames: Frame[] = [];
  const arr: T[] = [root];
  state.set(root.id, 'is-waiting');
  const html = () => draw(root, state) + queueRow('arr', arr) + outRow(out);
  frames.push({ html: html(), message: `เริ่มด้วย arr = [root] · ${depthFirst ? 'DFS ใส่ลูกไว้หน้า arr (เหมือน stack) จึงลงลึกก่อน' : 'BFS ใส่ลูกไว้ท้าย arr (เหมือน queue) จึงไปทีละชั้น'}`, line: 1 });
  while (arr.length) {
    const node = arr.shift()!;
    state.set(node.id, 'is-active');
    frames.push({ html: html(), message: `shift() ได้ ${node.data} ออกมาจากหน้า arr`, line: 3 });
    if (node.children.length) {
      if (depthFirst) arr.unshift(...node.children); else arr.push(...node.children);
      node.children.forEach(c => state.set(c.id, 'is-waiting'));
      frames.push({ html: html(), message: `${depthFirst ? 'unshift ลูก' : 'push ลูก'} [${node.children.map(c => c.data).join(', ')}] ${depthFirst ? 'ไว้หน้า arr' : 'ต่อท้าย arr'}`, line: 4 });
    }
    out.push(node.data);
    state.set(node.id, 'is-done');
    frames.push({ html: html(), message: `เรียก fn(${node.data}) · ลำดับตอนนี้: ${out.join(', ')}`, line: 5 });
  }
  frames.push({ html: html(), message: `${depthFirst ? 'Depth-First' : 'Breadth-First'} ได้ลำดับ ${out.join(', ')}`, line: 7 });
  return frames;
}

function levelWidth(): Frame[] {
  const root = sample(), state = new Map<number, string>(), frames: Frame[] = [];
  const arr: (T | 's')[] = [root, 's'], counters = [0];
  const html = () => draw(root, state) + queueRow('arr', arr) + `<div class="lab-row"><span class="lab-row-label">counters</span><code class="lab-string">[${counters.join(', ')}]</code></div>`;
  frames.push({ html: html(), message: "arr = [root, 's'] · 's' คือเครื่องหมายบอกว่าจบชั้นแล้ว", line: 0 });
  while (arr.length > 1) {
    const node = arr.shift()!;
    if (node === 's') {
      counters.push(0); arr.push('s');
      frames.push({ html: html(), message: `เจอ 's' = จบชั้นที่ ${counters.length - 2} แล้ว เริ่มนับชั้นใหม่ และใส่ 's' กลับไปท้าย arr`, line: 4 });
    } else {
      arr.push(...node.children);
      counters[counters.length - 1]++;
      state.set(node.id, 'is-done');
      frames.push({ html: html(), message: `${node.data}: นับเพิ่มในชั้นปัจจุบัน → ${counters.at(-1)}${node.children.length ? ` และ push ลูก [${node.children.map(c => c.data).join(', ')}]` : ''}`, line: 5 });
    }
  }
  frames.push({ html: html(), message: `เหลือแค่ 's' ตัวเดียว จบ · ความกว้างแต่ละชั้น = [${counters.join(', ')}]`, line: 7 });
  return frames;
}

interface B { data: number; left: B | null; right: B | null }
const bstTree = (n: B | null, state: Map<B, string>): TreeNode | null => n && ({ label: String(n.data), cls: state.get(n), children: n.left || n.right ? [bstTree(n.left, state), bstTree(n.right, state)] : [] });
function buildBst(values: number[]): B {
  const root: B = { data: values[0], left: null, right: null };
  for (const v of values.slice(1)) {
    let node = root;
    for (;;) {
      if (v < node.data) { if (node.left) node = node.left; else { node.left = { data: v, left: null, right: null }; break; } }
      else if (v > node.data) { if (node.right) node = node.right; else { node.right = { data: v, left: null, right: null }; break; } }
      else break;
    }
  }
  return root;
}

function bst(text: string, mode: 'insert' | 'contains'): Frame[] | string {
  const [valuesText = '', targetText = ''] = text.split('|');
  const values = parseNumbers(valuesText, 1, 12);
  if (typeof values === 'string') return values;
  const target = parseInteger(targetText, -999, 999);
  if (typeof target === 'string') return `ค่าที่ต้องการ${mode === 'insert' ? 'เพิ่ม' : 'ค้นหา'}: ${target} (ใส่หลัง |)`;
  const root = buildBst(values), state = new Map<B, string>(), frames: Frame[] = [];
  const html = () => `<div class="tree-scroll">${treeHtml(bstTree(root, state))}</div>`;
  frames.push({ html: html(), message: `BST จาก [${values.join(', ')}] · ทุก node: ซ้ายน้อยกว่า ขวามากกว่า`, line: 0 });
  let node: B | null = root, depth = 0;
  while (node) {
    depth++;
    state.set(node, 'is-active');
    if (node.data === target) {
      if (mode === 'contains') { state.set(node, 'is-done'); frames.push({ html: html(), message: `${target} === ${node.data} → เจอแล้ว ใช้ ${depth} ก้าว (เท่ากับความสูงของเส้นทาง ไม่ต้องดูทุก node)`, line: 1, stats: [['เทียบ', depth]] }); return frames; }
      frames.push({ html: html(), message: `${target} มีอยู่แล้วใน tree โค้ดนี้จะไม่เพิ่มซ้ำ`, line: 0, stats: [['เทียบ', depth]] });
      return frames;
    }
    const goLeft: boolean = target < node.data;
    const next: B | null = goLeft ? node.left : node.right;
    if (next) {
      frames.push({ html: html(), message: `${target} ${goLeft ? '<' : '>'} ${node.data} → ไปทาง${goLeft ? 'ซ้าย' : 'ขวา'}`, line: mode === 'insert' ? (goLeft ? 1 : 3) : (goLeft ? 3 : 2), stats: [['เทียบ', depth]] });
      state.set(node, 'is-muted');
      node = next;
      continue;
    }
    if (mode === 'insert') {
      const created: B = { data: target, left: null, right: null };
      if (goLeft) node.left = created; else node.right = created;
      state.set(created, 'is-new');
      frames.push({ html: html(), message: `${target} ${goLeft ? '<' : '>'} ${node.data} และฝั่ง${goLeft ? 'ซ้าย' : 'ขวา'}ว่าง → สร้าง node ใหม่ตรงนี้`, line: goLeft ? 2 : 4, stats: [['เทียบ', depth]] });
    } else {
      frames.push({ html: html(), message: `${target} ${goLeft ? '<' : '>'} ${node.data} แต่ฝั่ง${goLeft ? 'ซ้าย' : 'ขวา'}ว่าง → ไม่มี ${target} ใน tree (return null)`, line: 4, stats: [['เทียบ', depth]] });
    }
    return frames;
  }
  return frames;
}

const bstInput = (value: string) => ({ label: 'ค่าใน tree | ค่าเป้าหมาย', value, presets: ['10, 0, 12, -1, 4, 11, 20, 17, 99 | 15', '10, 5, 15, 0, 20, -5, 3 | 3', '10, 5, 15, 0, 20, -5, 3 | 7'], hint: 'ค่าแรกเป็น root ที่เหลือ insert ตามลำดับ' });

export const treeLab: LabSpec = {
  id: 'tree',
  title: 'Tree Lab',
  description: 'ดูลำดับการเดินต้นไม้แบบ BFS / DFS, การนับความกว้างแต่ละชั้น และการเดินหาใน Binary Search Tree',
  legend: [['k-range', 'กำลังทำงาน'], ['k-compare', 'รอใน arr', ['bfs', 'dfs', 'levelwidth']], ['k-sorted', 'เยี่ยมแล้ว / เจอ'], ['k-write', 'node ใหม่', ['insert']], ['k-muted', 'ผ่านมาแล้ว', ['insert', 'contains']]],
  modes: [
    {
      id: 'bfs', label: 'Breadth-First', complexity: 'O(n)',
      code: ['traverseBF(fn) {', '  const arr = [this.root];', '  while (arr.length) {', '    const node = arr.shift();', '    arr.push(...node.children);', '    fn(node);', '  }', '}'],
      build: () => traverse(false),
    },
    {
      id: 'dfs', label: 'Depth-First', complexity: 'O(n)',
      code: ['traverseDF(fn) {', '  const arr = [this.root];', '  while (arr.length) {', '    const node = arr.shift();', '    arr.unshift(...node.children);', '    fn(node);', '  }', '}'],
      build: () => traverse(true),
    },
    {
      id: 'levelwidth', label: 'Level Width', complexity: 'O(n)',
      code: ["const arr = [root, 's'];", 'const counters = [0];', 'while (arr.length > 1) {', '  const node = arr.shift();', "  if (node === 's') { counters.push(0); arr.push('s'); }", '  else { arr.push(...node.children); counters[counters.length - 1]++; }', '}', 'return counters;'],
      build: levelWidth,
    },
    {
      id: 'insert', label: 'BST insert', complexity: 'O(h)',
      code: ['insert(data) {', '  if (data < this.data && this.left) this.left.insert(data);', '  else if (data < this.data) this.left = new Node(data);', '  else if (data > this.data && this.right) this.right.insert(data);', '  else if (data > this.data) this.right = new Node(data);', '}'],
      input: bstInput('10, 0, 12, -1, 4, 11, 20, 17, 99 | 15'), build: text => bst(text, 'insert'),
    },
    {
      id: 'contains', label: 'BST contains', complexity: 'O(h)',
      code: ['contains(data) {', '  if (this.data === data) return this;', '  if (this.data < data && this.right) return this.right.contains(data);', '  else if (this.data > data && this.left) return this.left.contains(data);', '  return null;', '}'],
      input: bstInput('10, 5, 15, 0, 20, -5, 3 | 3'), build: text => bst(text, 'contains'),
    },
  ],
};
