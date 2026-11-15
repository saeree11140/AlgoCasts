// Group 05 "Stack & Queue": playgrounds that follow the array-backed classes in completed_exercises.
import { esc, parseOps, type Frame, type LabSpec } from './engine';

const MAX = 8;
const item = (v: string, cls = '') => `<div class="cell ${cls}"><b>${esc(v)}</b></div>`;
/** Queue.data as an array: add() unshifts at index 0, remove() pops from the end. */
const queueView = (data: string[], hot: { index: number; cls: string } | null, title = 'this.data') => `<div class="queue-view"><span class="flow">add → unshift</span><div class="cells">${data.length ? data.map((v, i) => item(v, hot && hot.index === i ? hot.cls : i === data.length - 1 ? 'is-front' : '')).join('') : '<em>[ ] ว่าง</em>'}</div><span class="flow">pop → remove</span></div><p class="lab-note">${title} = [${data.map(esc).join(', ')}] · ตัวขวาสุดออกก่อน</p>`;
const stackView = (data: string[], title: string, hot: { index: number; cls: string } | null) => `<div class="stack-view"><strong>${esc(title)}</strong><div class="stack-col">${data.length ? data.map((v, i) => item(v, hot && hot.index === i ? hot.cls : i === data.length - 1 ? 'is-front' : '')).reverse().join('') : '<em>ว่าง</em>'}</div><small>${data.length ? 'บนสุด = ' + esc(data[data.length - 1]) : ''}</small></div>`;

function script(text: string, allowed: string[]): string[][] | string {
  const ops = parseOps(text);
  if (ops.length > 24) return 'คำสั่งยาวเกินไป (สูงสุด 24 คำสั่ง) กด "ล้าง" แล้วเริ่มใหม่';
  for (const [op, arg] of ops) {
    if (!allowed.includes(op)) return `ไม่รู้จักคำสั่ง "${op}" ใช้ได้: ${allowed.join(', ')}`;
    if (arg && arg.length > 6) return 'ค่าแต่ละตัวยาวไม่เกิน 6 ตัวอักษร';
  }
  return ops;
}

function queue(text: string): Frame[] | string {
  const ops = script(text, ['add', 'remove', 'peek']);
  if (typeof ops === 'string') return ops;
  const data: string[] = [], frames: Frame[] = [{ html: queueView(data, null), message: 'คิวว่าง กด add เพื่อเพิ่มของเข้าคิว', line: 1 }];
  for (const [op, arg] of ops) {
    if (op === 'add') {
      if (!arg) return 'add ต้องมีค่า เช่น add A';
      if (data.length >= MAX) return `คิวนี้รับได้ไม่เกิน ${MAX} ตัวเพื่อให้แสดงผลพอดี`;
      data.unshift(arg);
      frames.push({ html: queueView(data, { index: 0, cls: 'is-new' }), message: `add('${arg}') → unshift ใส่ไว้หน้า array (index 0) ตัวอื่นเลื่อนไปทางขวา`, line: 2 });
    } else if (op === 'remove') {
      if (!data.length) { frames.push({ html: queueView(data, null), message: 'remove() บนคิวว่างได้ undefined', line: 3 }); continue; }
      frames.push({ html: queueView(data, { index: data.length - 1, cls: 'is-swap' }), message: `remove() → ตัวที่เข้ามาก่อนสุดคือ '${data[data.length - 1]}' อยู่ท้าย array`, line: 3 });
      const out = data.pop()!;
      frames.push({ html: queueView(data, null), message: `pop() ได้ '${out}' ออกไป (First In, First Out)`, line: 3 });
    } else {
      frames.push({ html: queueView(data, data.length ? { index: data.length - 1, cls: 'is-compare' } : null), message: data.length ? `peek() → '${data[data.length - 1]}' ดูตัวที่จะออกถัดไปโดยไม่เอาออก` : 'peek() บนคิวว่างได้ undefined', line: 4 });
    }
  }
  return frames;
}

function stack(text: string): Frame[] | string {
  const ops = script(text, ['push', 'pop', 'peek']);
  if (typeof ops === 'string') return ops;
  const data: string[] = [], frames: Frame[] = [{ html: stackView(data, 'stack', null), message: 'stack ว่าง กด push เพื่อวางของไว้บนสุด', line: 1 }];
  for (const [op, arg] of ops) {
    if (op === 'push') {
      if (!arg) return 'push ต้องมีค่า เช่น push A';
      if (data.length >= MAX) return `stack นี้รับได้ไม่เกิน ${MAX} ตัวเพื่อให้แสดงผลพอดี`;
      data.push(arg);
      frames.push({ html: stackView(data, 'stack', { index: data.length - 1, cls: 'is-new' }), message: `push('${arg}') → วางไว้บนสุด`, line: 2 });
    } else if (op === 'pop') {
      if (!data.length) { frames.push({ html: stackView(data, 'stack', null), message: 'pop() บน stack ว่างได้ undefined', line: 3 }); continue; }
      frames.push({ html: stackView(data, 'stack', { index: data.length - 1, cls: 'is-swap' }), message: `pop() → หยิบตัวบนสุด '${data[data.length - 1]}' ซึ่งเข้ามาล่าสุด`, line: 3 });
      const out = data.pop()!;
      frames.push({ html: stackView(data, 'stack', null), message: `ได้ '${out}' (Last In, First Out)`, line: 3 });
    } else {
      frames.push({ html: stackView(data, 'stack', data.length ? { index: data.length - 1, cls: 'is-compare' } : null), message: data.length ? `peek() → '${data[data.length - 1]}' ดูตัวบนสุดโดยไม่หยิบออก` : 'peek() บน stack ว่างได้ undefined', line: 4 });
    }
  }
  return frames;
}

function qfroms(text: string): Frame[] | string {
  const ops = script(text, ['add', 'remove', 'peek']);
  if (typeof ops === 'string') return ops;
  const first: string[] = [], second: string[] = [], frames: Frame[] = [];
  const view = (hotFirst: { index: number; cls: string } | null = null, hotSecond: { index: number; cls: string } | null = null) => `<div class="stack-pair">${stackView(first, 'first (Stack A)', hotFirst)}${stackView(second, 'second (Stack B)', hotSecond)}</div>`;
  frames.push({ html: view(), message: 'ใช้ stack 2 อัน ทำตัวเป็นคิว (First In, First Out)', line: -1 });
  const transfer = (from: string[], to: string[], label: string, line: number) => {
    while (from.length) {
      to.push(from.pop()!);
      frames.push({ html: from === first ? view(null, { index: to.length - 1, cls: 'is-new' }) : view({ index: to.length - 1, cls: 'is-new' }), message: `${label}: ย้าย '${to[to.length - 1]}'`, line });
    }
  };
  for (const [op, arg] of ops) {
    if (op === 'add') {
      if (!arg) return 'add ต้องมีค่า เช่น add A';
      if (first.length >= MAX) return `รับได้ไม่เกิน ${MAX} ตัวเพื่อให้แสดงผลพอดี`;
      first.push(arg);
      frames.push({ html: view({ index: first.length - 1, cls: 'is-new' }), message: `add('${arg}') → push ลง Stack A ธรรมดา`, line: 0 });
      continue;
    }
    if (!first.length) { frames.push({ html: view(), message: `${op}() บนคิวว่างได้ undefined`, line: op === 'remove' ? 3 : 8 }); continue; }
    transfer(first, second, 'เทจาก A ไป B ให้ตัวที่เข้าก่อนขึ้นมาอยู่บนสุดของ B', op === 'remove' ? 2 : 8);
    const top = second[second.length - 1];
    if (op === 'remove') {
      frames.push({ html: view(null, { index: second.length - 1, cls: 'is-swap' }), message: `บนสุดของ B คือ '${top}' ตัวที่เข้ามาก่อนสุด → pop ออก`, line: 3 });
      second.pop();
    } else {
      frames.push({ html: view(null, { index: second.length - 1, cls: 'is-compare' }), message: `peek ที่ B ได้ '${top}' โดยไม่เอาออก`, line: 8 });
    }
    transfer(second, first, 'เทกลับจาก B ไป A ให้ add ครั้งถัดไปต่อท้ายได้ถูก', op === 'remove' ? 4 : 8);
    frames.push({ html: view(), message: `${op}() คืน '${top}'`, line: op === 'remove' ? 5 : 8 });
  }
  return frames;
}

function weave(text: string): Frame[] | string {
  const [a = '', b = ''] = text.split('|');
  const one = a.split(',').map(s => s.trim()).filter(Boolean), two = b.split(',').map(s => s.trim()).filter(Boolean);
  if (!one.length || !two.length) return 'ใส่ 2 คิว คั่นด้วย | เช่น 1, 2, 3 | Hi, To, You';
  if (one.length > 6 || two.length > 6 || [...one, ...two].some(v => v.length > 6)) return 'คิวละไม่เกิน 6 ตัว ค่าละไม่เกิน 6 ตัวอักษร';
  // A Queue built with add() stores the first item at the end of its array.
  const q1 = [...one].reverse(), q2 = [...two].reverse(), result: string[] = [], frames: Frame[] = [];
  const view = (hot?: 1 | 2) => `${queueView(q1, hot === 1 && q1.length ? { index: q1.length - 1, cls: 'is-compare' } : null, 'sourceOne')}${queueView(q2, hot === 2 && q2.length ? { index: q2.length - 1, cls: 'is-compare' } : null, 'sourceTwo')}${queueView(result, result.length ? { index: 0, cls: 'is-new' } : null, 'q (ผลลัพธ์)')}`;
  frames.push({ html: view(), message: 'สร้างคิวผลลัพธ์ q แล้ววนตราบใดที่คิวใดคิวหนึ่งยังมีของ', line: 0 });
  while (q1.length || q2.length) {
    if (q1.length) { frames.push({ html: view(1), message: `sourceOne.peek() = '${q1[q1.length - 1]}' มีของ → ย้ายเข้า q`, line: 2 }); result.unshift(q1.pop()!); frames.push({ html: view(), message: `q.add('${result[0]}')`, line: 2 }); }
    else frames.push({ html: view(), message: 'sourceOne หมดแล้ว peek() ได้ undefined จึงข้าม', line: 2 });
    if (q2.length) { frames.push({ html: view(2), message: `sourceTwo.peek() = '${q2[q2.length - 1]}' มีของ → ย้ายเข้า q`, line: 3 }); result.unshift(q2.pop()!); frames.push({ html: view(), message: `q.add('${result[0]}')`, line: 3 }); }
    else frames.push({ html: view(), message: 'sourceTwo หมดแล้ว peek() ได้ undefined จึงข้าม', line: 3 });
  }
  frames.push({ html: view(), message: `ทั้งสองคิวหมด ได้ลำดับ ${[...result].reverse().join(', ')}`, line: 5 });
  return frames;
}

export const stackQueueLab: LabSpec = {
  id: 'stackqueue',
  title: 'Stack & Queue Lab',
  description: 'ใส่ค่าแล้วกดปุ่มคำสั่ง หรือแก้ลำดับคำสั่งในช่องด้านบนเอง ดูว่าแต่ละโครงสร้างเก็บและหยิบของจากปลายไหน',
  legend: [['k-write', 'เพิ่งเพิ่ม'], ['k-swap', 'กำลังถูกนำออก'], ['k-compare', 'peek'], ['k-front', 'ตัวที่จะออกถัดไป']],
  modes: [
    {
      id: 'queue', label: 'Queue', complexity: 'add O(n) (unshift) · remove O(1)',
      code: ['class Queue {', '  constructor() { this.data = []; }', '  add(record) { this.data.unshift(record); }', '  remove() { return this.data.pop(); }', '  peek() { return this.data[this.data.length - 1]; }', '}'],
      input: { label: 'คำสั่ง', value: 'add A, add B, add C, remove, peek', presets: ['add A, add B, add C, remove, peek'] },
      actions: [{ label: 'add', op: 'add', value: true }, { label: 'remove', op: 'remove' }, { label: 'peek', op: 'peek' }],
      build: queue,
    },
    {
      id: 'stack', label: 'Stack', complexity: 'push/pop O(1)',
      code: ['class Stack {', '  constructor() { this.data = []; }', '  push(record) { this.data.push(record); }', '  pop() { return this.data.pop(); }', '  peek() { return this.data[this.data.length - 1]; }', '}'],
      input: { label: 'คำสั่ง', value: 'push A, push B, push C, pop, peek', presets: ['push A, push B, push C, pop, peek'] },
      actions: [{ label: 'push', op: 'push', value: true }, { label: 'pop', op: 'pop' }, { label: 'peek', op: 'peek' }],
      build: stack,
    },
    {
      id: 'qfroms', label: 'Queue จาก 2 Stack', complexity: 'remove O(n)',
      code: ['add(record) { this.first.push(record); }', 'remove() {', '  while (this.first.peek()) this.second.push(this.first.pop());', '  const record = this.second.pop();', '  while (this.second.peek()) this.first.push(this.second.pop());', '  return record;', '}', 'peek() {', '  // ย้ายไป second → ดู second.peek() → ย้ายกลับ', '}'],
      input: { label: 'คำสั่ง', value: 'add Green, add Blue, add Red, remove, peek', presets: ['add Green, add Blue, add Red, remove, peek'] },
      actions: [{ label: 'add', op: 'add', value: true }, { label: 'remove', op: 'remove' }, { label: 'peek', op: 'peek' }],
      build: qfroms,
    },
    {
      id: 'weave', label: 'Weave', complexity: 'O(n + m)',
      code: ['const q = new Queue();', 'while (sourceOne.peek() || sourceTwo.peek()) {', '  if (sourceOne.peek()) q.add(sourceOne.remove());', '  if (sourceTwo.peek()) q.add(sourceTwo.remove());', '}', 'return q;'],
      input: { label: 'คิว 1 | คิว 2', value: '1, 2, 3 | Hi, To, You', presets: ['1, 2, 3 | Hi, To, You', '1, 2, 3 | Hi'], hint: 'ใส่ค่าตามลำดับที่ add เข้าคิว' },
      build: weave,
    },
  ],
};
