// Groups 06 and 07: a LinkedList playground, and the slow/fast pointer tricks (midpoint, circular, fromLast).
import { esc, parseInteger, parseOps, type Frame, type LabSpec } from './engine';

interface Marker { index: number; label: string; cls: string }
/** Draws head → node → node → null. `loopTo` draws the tail's next pointing back into the list. */
function chain(values: string[], markers: Marker[] = [], extra: { index: number; cls: string }[] = [], loopTo?: number): string {
  const nodes = values.map((v, i) => {
    const cls = extra.find(e => e.index === i)?.cls ?? markers.find(m => m.index === i)?.cls ?? '';
    const tags = markers.filter(m => m.index === i).map(m => `<span class="ptr ${m.cls}">${esc(m.label)}</span>`).join('');
    return `<div class="ll-item"><div class="ll-node ${cls}"><b>${esc(v)}</b><small>[${i}]</small></div><div class="ll-tags">${tags}</div></div><span class="ll-arrow" aria-hidden="true">→</span>`;
  }).join('');
  const tail = loopTo === undefined ? '<span class="ll-null">null</span>' : `<span class="ll-null is-loop">↩ กลับไป [${loopTo}] ${esc(values[loopTo])}</span>`;
  return `<div class="ll"><span class="ll-head">head</span><span class="ll-arrow" aria-hidden="true">→</span>${nodes}${tail}</div>`;
}

const MAX = 9;

function linkedList(text: string): Frame[] | string {
  const ops = parseOps(text);
  if (ops.length > 20) return 'คำสั่งยาวเกินไป (สูงสุด 20 คำสั่ง) กด "ล้าง" แล้วเริ่มใหม่';
  const list: string[] = [], frames: Frame[] = [];
  const stats = () => [['size', list.length] as [string, number]];
  frames.push({ html: chain(list), message: 'list ว่าง: this.head = null', line: -1, stats: stats() });
  // getAt walk shared by getAt, insertAt and removeAt
  const walk = (target: number, label: string) => {
    for (let counter = 0; counter < list.length; counter++) {
      const hit = counter === target;
      frames.push({ html: chain(list, [{ index: counter, label: `node (counter=${counter})`, cls: hit ? 'is-done' : 'is-active' }]), message: hit ? `${label}: counter = ${counter} ตรงกับ index ที่ต้องการ` : `${label}: counter = ${counter} ยังไม่ถึง เดินไป node.next`, line: hit ? 3 : 4, stats: stats() });
      if (hit) return true;
    }
    frames.push({ html: chain(list), message: `${label}: เดินจนเจอ null แล้วยังไม่ถึง index ${target} → คืน null`, line: 5, stats: stats() });
    return false;
  };
  for (const [op, a, b] of ops) {
    const needData = ['insertFirst', 'insertLast', 'insertAt'].includes(op);
    if (needData && !a) return `${op} ต้องมีค่า เช่น ${op} X${op === 'insertAt' ? ' 1' : ''}`;
    if (a && a.length > 6) return 'ค่าแต่ละตัวยาวไม่เกิน 6 ตัวอักษร';
    if (needData && list.length >= MAX) return `แสดงได้ไม่เกิน ${MAX} node`;
    switch (op) {
      case 'insertFirst':
        list.unshift(a);
        frames.push({ html: chain(list, [], [{ index: 0, cls: 'is-new' }]), message: `insertFirst('${a}') → node ใหม่ชี้ next ไปที่ head เดิม แล้วตั้ง head ใหม่ · O(1)`, line: 0, stats: stats() });
        break;
      case 'insertLast':
        if (list.length) walk(list.length - 1, 'หา node สุดท้าย');
        list.push(a);
        frames.push({ html: chain(list, [], [{ index: list.length - 1, cls: 'is-new' }]), message: `insertLast('${a}') → last.next = new Node('${a}') · ต้องเดินหา node สุดท้ายก่อน จึงเป็น O(n)`, line: 1, stats: stats() });
        break;
      case 'getAt': {
        const index = parseInteger(a ?? '', 0, 99);
        if (typeof index === 'string') return 'getAt ต้องมี index เช่น getAt 2';
        if (walk(index, `getAt(${index})`)) frames.push({ html: chain(list, [{ index, label: 'return', cls: 'is-done' }]), message: `คืน node ที่ index ${index} = '${list[index]}' · ต้องเดินจาก head ทุกครั้ง จึงเป็น O(n) ต่างจาก array ที่เป็น O(1)`, line: 3, stats: stats() });
        break;
      }
      case 'insertAt': {
        const index = parseInteger(b ?? '', 0, 99);
        if (typeof index === 'string') return 'insertAt ต้องมีค่าและ index เช่น insertAt X 1';
        if (index === 0 || !list.length) { list.unshift(a); frames.push({ html: chain(list, [], [{ index: 0, cls: 'is-new' }]), message: `insertAt('${a}', ${index}) ที่ index 0 คือ insertFirst`, line: 0, stats: stats() }); break; }
        const at = Math.min(index, list.length);
        walk(at - 1, `หา previous = getAt(${index - 1})`);
        list.splice(at, 0, a);
        frames.push({ html: chain(list, [{ index: at - 1, label: 'previous', cls: 'is-active' }], [{ index: at, cls: 'is-new' }]), message: `${at < index ? `index ${index} เกินท้ายลิสต์ จึงใส่ต่อท้ายแทน · ` : ''}previous.next = new Node('${a}', previous.next) แค่เปลี่ยน pointer 2 ตัว ไม่ต้องเลื่อนของ`, line: 7, stats: stats() });
        break;
      }
      case 'removeFirst':
        if (!list.length) { frames.push({ html: chain(list), message: 'list ว่าง ไม่มีอะไรให้ลบ', line: 9, stats: stats() }); break; }
        frames.push({ html: chain(list, [], [{ index: 0, cls: 'is-swap' }]), message: `removeFirst() → this.head = this.head.next ข้าม '${list[0]}'`, line: 9, stats: stats() });
        list.shift();
        frames.push({ html: chain(list), message: 'head ชี้ไป node ถัดไปแล้ว · O(1)', line: 9, stats: stats() });
        break;
      case 'removeLast':
      case 'removeAt': {
        const index = op === 'removeLast' ? list.length - 1 : parseInteger(a ?? '', 0, 99);
        if (typeof index === 'string') return 'removeAt ต้องมี index เช่น removeAt 1';
        if (index < 0 || index >= list.length) { frames.push({ html: chain(list), message: `ไม่มี node ที่ index ${index} จึงไม่ลบอะไร`, line: 8, stats: stats() }); break; }
        if (index > 0) walk(index - 1, `หา previous = getAt(${index - 1})`);
        frames.push({ html: chain(list, index > 0 ? [{ index: index - 1, label: 'previous', cls: 'is-active' }] : [], [{ index, cls: 'is-swap' }]), message: index > 0 ? `previous.next = previous.next.next → ข้าม '${list[index]}'` : `ลบตัวแรก: this.head = this.head.next`, line: op === 'removeLast' ? 10 : 8, stats: stats() });
        list.splice(index, 1);
        frames.push({ html: chain(list), message: `ลบ index ${index} แล้ว ไม่มี pointer ชี้ไปหา node นั้นอีก`, line: op === 'removeLast' ? 10 : 8, stats: stats() });
        break;
      }
      case 'clear':
        list.length = 0;
        frames.push({ html: chain(list), message: 'clear() → this.head = null', line: -1, stats: stats() });
        break;
      default:
        return `ไม่รู้จักคำสั่ง "${op}"`;
    }
  }
  return frames;
}

const listOf = (text: string, min = 1): string[] | string => {
  const values = text.split(',').map(s => s.trim()).filter(Boolean);
  if (values.length < min || values.length > 9) return `ใส่ ${min}–9 ค่า คั่นด้วย comma`;
  if (values.some(v => v.length > 6)) return 'ค่าแต่ละตัวยาวไม่เกิน 6 ตัวอักษร';
  return values;
};

function midpoint(text: string): Frame[] | string {
  const list = listOf(text);
  if (typeof list === 'string') return list;
  let slow = 0, fast = 0;
  const view = () => chain(list, [{ index: slow, label: 'slow', cls: 'is-min' }, { index: fast, label: 'fast', cls: 'is-compare' }]);
  const frames: Frame[] = [{ html: view(), message: 'slow กับ fast เริ่มที่ head ทั้งคู่', line: 0 }];
  while (fast + 2 < list.length) {
    slow += 1; fast += 2;
    frames.push({ html: view(), message: `fast.next.next ยังมี → slow เดิน 1 ก้าว (ไป [${slow}]) fast เดิน 2 ก้าว (ไป [${fast}])`, line: 2 });
  }
  frames.push({ html: view(), message: `fast ${fast === list.length - 1 ? 'อยู่ node สุดท้าย' : 'เหลืออีกแค่ 1 node'} เดิน 2 ก้าวไม่ได้แล้ว → slow อยู่ตรงกลาง: '${list[slow]}'${list.length % 2 === 0 ? ' (จำนวนคู่ ได้ตัวกลางตัวแรก)' : ''}`, line: 4 });
  return frames;
}

function circular(text: string): Frame[] | string {
  const [listText = '', loopText = ''] = text.split('|');
  const list = listOf(listText, 2);
  if (typeof list === 'string') return list;
  let loopTo: number | undefined;
  if (loopText.trim()) {
    const parsed = parseInteger(loopText, 0, list.length - 1);
    if (typeof parsed === 'string') return `index ที่ node สุดท้ายวนกลับไป: ${parsed}`;
    loopTo = parsed;
  }
  const next = (i: number) => (i + 1 < list.length ? i + 1 : loopTo ?? -1);
  let slow = 0, fast = 0, step = 0;
  const view = () => chain(list, [{ index: slow, label: 'slow', cls: 'is-min' }, { index: fast, label: 'fast', cls: 'is-compare' }], [], loopTo);
  const frames: Frame[] = [{ html: view(), message: loopTo === undefined ? 'list นี้จบที่ null (ไม่มีวง)' : `node สุดท้ายชี้กลับไป [${loopTo}] จึงเกิดวง`, line: 0 }];
  while (next(fast) !== -1 && next(next(fast)) !== -1 && step < 40) {
    slow = next(slow); fast = next(next(fast)); step++;
    if (slow === fast) {
      frames.push({ html: view(), message: `slow กับ fast มาเจอกันที่ '${list[slow]}' → fast วิ่งวนมาทันได้ แปลว่ามีวง (return true)`, line: 3 });
      return frames;
    }
    frames.push({ html: view(), message: `slow ไป [${slow}] · fast ไป [${fast}] ยังไม่เจอกัน`, line: 2 });
  }
  frames.push({ html: view(), message: 'fast เดินไปเจอ null ก่อน → ไม่มีวง (return false)', line: 5 });
  return frames;
}

function fromLast(text: string): Frame[] | string {
  const [listText = '', nText = ''] = text.split('|');
  const list = listOf(listText, 2);
  if (typeof list === 'string') return list;
  const n = parseInteger(nText, 0, list.length - 1);
  if (typeof n === 'string') return `n: ${n} (เช่น a, b, c, d, e | 2)`;
  let slow = 0, fast = 0;
  const view = () => chain(list, [{ index: slow, label: 'slow', cls: 'is-min' }, { index: fast, label: 'fast', cls: 'is-compare' }]);
  const frames: Frame[] = [{ html: view(), message: `ต้องการ node ที่ห่างจากตัวสุดท้าย ${n} ตำแหน่ง`, line: 0 }];
  for (let k = 0; k < n; k++) { fast++; frames.push({ html: view(), message: `ให้ fast นำไปก่อน ${k + 1}/${n} ก้าว`, line: 1 }); }
  while (fast < list.length - 1) { slow++; fast++; frames.push({ html: view(), message: `เดินทั้งคู่ทีละ 1 ก้าว ระยะห่างยังเป็น ${n} เสมอ`, line: 3 }); }
  frames.push({ html: view(), message: `fast ถึง node สุดท้ายแล้ว → slow = '${list[slow]}' อยู่ห่างจากท้าย ${n} ตำแหน่ง`, line: 5 });
  return frames;
}

export const linkedListLab: LabSpec = {
  id: 'linkedlist',
  title: 'Linked List Lab',
  description: 'สั่ง insert / remove / getAt แล้วดูว่า linked list ต้องเดินจาก head ทีละ node อย่างไร และเปลี่ยน pointer ตัวไหน',
  legend: [['k-range', 'node ที่กำลังเดินถึง'], ['k-sorted', 'เจอตำแหน่งแล้ว'], ['k-write', 'node ใหม่'], ['k-swap', 'node ที่จะถูกลบ']],
  modes: [{
    id: 'list', label: 'LinkedList', complexity: 'getAt O(n) · insertFirst O(1)',
    code: ['insertFirst(data) { this.head = new Node(data, this.head); }', 'insertLast(data) { this.getLast().next = new Node(data); }', 'getAt(index) { let counter = 0, node = this.head;', '  while (node) { if (counter === index) return node;', '    counter++; node = node.next; }', '  return null; }', '// insertAt / removeAt ใช้ getAt(index - 1) หา previous ก่อน', 'insertAt(data, index) { previous.next = new Node(data, previous.next); }', 'removeAt(index) { previous.next = previous.next.next; }', 'removeFirst() { this.head = this.head.next; }', 'removeLast() { previous.next = null; }'],
    input: { label: 'คำสั่ง', value: 'insertLast A, insertLast B, insertLast C, insertFirst Z, getAt 2, insertAt X 2, removeAt 1', presets: ['insertLast A, insertLast B, insertLast C, insertFirst Z, getAt 2, insertAt X 2, removeAt 1'], hint: 'insertAt ใส่ "ค่า index" เช่น X 2 · getAt / removeAt ใส่แค่ index' },
    actions: [{ label: 'insertFirst', op: 'insertFirst', value: true }, { label: 'insertLast', op: 'insertLast', value: true }, { label: 'insertAt', op: 'insertAt', value: true }, { label: 'getAt', op: 'getAt', value: true }, { label: 'removeAt', op: 'removeAt', value: true }, { label: 'removeFirst', op: 'removeFirst' }, { label: 'removeLast', op: 'removeLast' }],
    build: linkedList,
  }],
};

export const pointersLab: LabSpec = {
  id: 'pointers',
  title: 'Slow & Fast Pointer Lab',
  description: 'สอง pointer ที่เดินเร็วไม่เท่ากันแก้โจทย์ linked list ได้โดยไม่ต้องรู้ขนาดล่วงหน้า',
  legend: [['k-min', 'slow (ทีละ 1)'], ['k-compare', 'fast']],
  modes: [
    {
      id: 'midpoint', label: 'Midpoint', complexity: 'O(n)',
      code: ['let slow = list.getFirst(), fast = list.getFirst();', 'while (fast.next && fast.next.next) {', '  slow = slow.next; fast = fast.next.next;', '}', 'return slow;'],
      input: { label: 'list', value: 'a, b, c, d, e', presets: ['a, b, c, d, e', 'a, b, c, d', 'a'] }, build: midpoint,
    },
    {
      id: 'circular', label: 'Circular', complexity: 'O(n)',
      code: ['let slow = list.getFirst(), fast = list.getFirst();', 'while (fast.next && fast.next.next) {', '  slow = slow.next; fast = fast.next.next;', '  if (slow === fast) return true;', '}', 'return false;'],
      input: { label: 'list | วนไป index', value: 'a, b, c, d, e | 2', presets: ['a, b, c, d, e | 2', 'a, b, c, d, e'], hint: 'ใส่ | ตามด้วย index ที่ node สุดท้ายชี้กลับไป หรือเว้นว่างถ้าไม่มีวง' }, build: circular,
    },
    {
      id: 'fromlast', label: 'From Last', complexity: 'O(n)',
      code: ['let slow = list.getFirst(), fast = list.getFirst();', 'while (n > 0) { fast = fast.next; n--; }', '', 'while (fast.next) { slow = slow.next; fast = fast.next; }', '', 'return slow;'],
      input: { label: 'list | n', value: 'a, b, c, d, e, f | 3', presets: ['a, b, c, d, e, f | 3', 'a, b, c | 0'] }, build: fromLast,
    },
  ],
};
