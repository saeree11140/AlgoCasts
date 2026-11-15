// Group 02 "String & Array": reverse, palindrome, max character and anagram, one character at a time.
import { esc, type Frame, type LabSpec } from './engine';

const show = (c: string) => (c === ' ' ? '␣' : esc(c));
const checkText = (text: string, max = 24): string | null => (!text.length ? 'พิมพ์ข้อความอย่างน้อย 1 ตัวอักษร' : [...text].length > max ? `ข้อความยาวไม่เกิน ${max} ตัวอักษร` : null);
const chars = (list: string[], cls: (i: number) => string = () => '', label = true) => `<div class="cells">${list.map((c, i) => `<div class="cell ${cls(i)}"><b>${show(c)}</b>${label ? `<small>${i}</small>` : ''}</div>`).join('')}</div>`;
const caption = (label: string, body: string) => `<div class="lab-row"><span class="lab-row-label">${label}</span>${body}</div>`;
const tally = (map: Map<string, number>, hot?: string, best?: string) => `<div class="tally">${[...map].map(([c, n]) => `<div class="${c === hot ? 'is-new' : c === best ? 'is-done' : ''}"><b>${show(c)}</b><span>${n}</span></div>`).join('') || '<em>{ }</em>'}</div>`;

function reverse(text: string): Frame[] | string {
  const error = checkText(text); if (error) return error;
  const list = [...text];
  let reversed = '';
  const stage = (i: number) => caption('str', chars(list, k => (k === i ? 'is-active' : k < i ? 'is-muted' : ''))) + caption('reversed', `<code class="lab-string">"${esc(reversed)}"</code>`);
  const frames: Frame[] = [{ html: stage(-1), message: "เริ่มจาก reversed = '' (ข้อความว่าง)", line: 0 }];
  list.forEach((c, i) => {
    reversed = c + reversed;
    frames.push({ html: stage(i), message: `หยิบ '${c}' มาวางไว้หน้าสุด → reversed = '${reversed}'`, line: 2, stats: [['ตัวอักษรที่อ่านแล้ว', `${i + 1}/${list.length}`]] });
  });
  frames.push({ html: stage(list.length), message: `คืนค่า '${reversed}' · อ่านทุกตัวครั้งเดียว จึงเป็น O(n)`, line: 4 });
  return frames;
}

function palindrome(text: string): Frame[] | string {
  const error = checkText(text); if (error) return error;
  const list = [...text], n = list.length, frames: Frame[] = [];
  const stage = (i: number, state: string) => chars(list, k => (k === i || k === n - 1 - i ? state : ''));
  frames.push({ html: stage(-1, ''), message: `every จะเทียบตัวที่ i กับตัวที่ ${n} - 1 - i ไปเรื่อยๆ และหยุดทันทีเมื่อเจอคู่ที่ไม่เท่ากัน`, line: 0 });
  let ok = true, checks = 0;
  for (let i = 0; i < n; i++) {
    const j = n - 1 - i, same = list[i] === list[j];
    checks++;
    frames.push({ html: stage(i, same ? 'is-done' : 'is-swap'), message: `i = ${i}: '${list[i]}' กับ '${list[j]}' (index ${j}) → ${same ? 'เท่ากัน ไปต่อ' : 'ไม่เท่ากัน every คืน false ทันที'}`, line: 1, stats: [['เทียบ', `${checks} ครั้ง`]] });
    if (!same) { ok = false; break; }
  }
  frames.push({ html: stage(-1, ''), message: ok ? `"${text}" เป็น palindrome · สังเกตว่าครึ่งหลังเทียบซ้ำกับครึ่งแรก ถ้าใช้ loop เทียบแค่ครึ่งเดียวก็พอ` : `"${text}" ไม่ใช่ palindrome`, line: 2, stats: [['เทียบ', `${checks} ครั้ง`], ['ผลลัพธ์', String(ok)]] });
  return frames;
}

function maxChar(text: string): Frame[] | string {
  const error = checkText(text); if (error) return error;
  const list = [...text], map = new Map<string, number>(), frames: Frame[] = [];
  const stage = (i: number, hot?: string, best?: string) => caption('str', chars(list, k => (k === i ? 'is-active' : ''))) + caption('charMap', tally(map, hot, best));
  frames.push({ html: stage(-1), message: 'สร้าง charMap = {} ไว้นับว่าตัวอักษรแต่ละตัวเจอกี่ครั้ง', line: 0 });
  list.forEach((c, i) => {
    map.set(c, (map.get(c) ?? 0) + 1);
    frames.push({ html: stage(i, c), message: `'${show(c)}' → charMap['${show(c)}'] = ${map.get(c)}`, line: 2 });
  });
  let max = 0, best = '';
  for (const [c, n] of map) {
    const better = n > max;
    if (better) { max = n; best = c; }
    frames.push({ html: stage(-1, c, best), message: `'${show(c)}' เจอ ${n} ครั้ง → ${better ? `มากที่สุดตอนนี้ (max = ${n})` : `ไม่มากกว่า max = ${max}`}`, line: better ? 6 : 5 });
  }
  frames.push({ html: stage(-1, undefined, best), message: `ตัวที่เจอบ่อยที่สุดคือ '${show(best)}' (${max} ครั้ง) · ใช้ 2 loop ที่ไม่ซ้อนกัน จึงยังเป็น O(n)`, line: 8 });
  return frames;
}

function anagram(text: string): Frame[] | string {
  const [a = '', b = ''] = text.split('|').map(s => s.trim());
  if (!a || !b) return 'ใส่ข้อความ 2 ชุดคั่นด้วย | เช่น rail safety | fairy tales';
  if ([...a].length > 24 || [...b].length > 24) return 'ข้อความแต่ละชุดยาวไม่เกิน 24 ตัวอักษร';
  const clean = (s: string) => s.replace(/[^\w]/g, '').toLowerCase();
  const ca = clean(a), cb = clean(b), ma = new Map<string, number>(), mb = new Map<string, number>(), frames: Frame[] = [];
  const stage = (hot?: string, bad?: string) => caption('A', tally(ma, hot, undefined)) + caption('B', tally(mb, hot, undefined)) + (bad ? `<p class="lab-note is-bad">${esc(bad)}</p>` : '');
  frames.push({ html: stage(), message: `ตัดช่องว่างกับเครื่องหมาย แล้วทำเป็นตัวพิมพ์เล็ก: "${ca}" กับ "${cb}"`, line: 0 });
  for (const c of ca) { ma.set(c, (ma.get(c) ?? 0) + 1); }
  frames.push({ html: stage(), message: `นับตัวอักษรของ A ได้ ${ma.size} แบบ`, line: 1 });
  for (const c of cb) { mb.set(c, (mb.get(c) ?? 0) + 1); }
  frames.push({ html: stage(), message: `นับตัวอักษรของ B ได้ ${mb.size} แบบ`, line: 1 });
  if (ma.size !== mb.size) {
    frames.push({ html: stage(undefined, `จำนวนชนิดตัวอักษรไม่เท่ากัน (${ma.size} กับ ${mb.size})`), message: 'จำนวน key ไม่เท่ากัน ตอบ false ได้เลยโดยไม่ต้องไล่เทียบ', line: 2 });
    return frames;
  }
  for (const [c, n] of ma) {
    const same = mb.get(c) === n;
    frames.push({ html: stage(c, same ? undefined : `'${c}' ไม่ตรงกัน`), message: `'${c}': A มี ${n} ตัว, B มี ${mb.get(c) ?? 0} ตัว → ${same ? 'ตรงกัน' : 'ไม่ตรง ตอบ false'}`, line: 4 });
    if (!same) return frames;
  }
  frames.push({ html: stage(), message: `ทุกตัวอักษรมีจำนวนเท่ากัน → "${a}" กับ "${b}" เป็น anagram`, line: 6 });
  return frames;
}

export const stringsLab: LabSpec = {
  id: 'strings',
  title: 'String Lab',
  description: 'พิมพ์ข้อความของคุณเอง แล้วดูทีละตัวอักษรว่าแต่ละเทคนิคทำงานอย่างไร',
  legend: [['k-range', 'ตัวที่กำลังอ่าน', ['reverse', 'maxchar']], ['k-sorted', 'ตรงกัน / มากที่สุด', ['palindrome', 'maxchar']], ['k-swap', 'ไม่ตรงกัน', ['palindrome']], ['k-write', 'เพิ่งนับ', ['maxchar', 'anagram']]],
  modes: [
    {
      id: 'reverse', label: 'Reverse', complexity: 'O(n)',
      code: ["let reversed = '';", 'for (let character of str) {', '  reversed = character + reversed;', '}', 'return reversed;'],
      input: { label: 'ข้อความ', value: 'Hello', presets: ['Hello', 'abcd'] }, build: reverse,
    },
    {
      id: 'palindrome', label: 'Palindrome', complexity: 'O(n)',
      code: ["return str.split('').every((char, i) => {", '  return char === str[str.length - i - 1];', '});'],
      input: { label: 'ข้อความ', value: 'abcba', presets: ['abcba', 'abcda', 'level'] }, build: palindrome,
    },
    {
      id: 'maxchar', label: 'Max Char', complexity: 'O(n)',
      code: ['const charMap = {};', 'for (let char of str) {', '  charMap[char] = charMap[char] + 1 || 1;', '}', "let max = 0, maxChar = '';", 'for (let char in charMap) {', '  if (charMap[char] > max) { max = charMap[char]; maxChar = char; }', '}', 'return maxChar;'],
      input: { label: 'ข้อความ', value: 'Hello There!', presets: ['Hello There!', 'abccccdd'] }, build: maxChar,
    },
    {
      id: 'anagram', label: 'Anagram', complexity: 'O(n + m)',
      code: ["clean = s => s.replace(/[^\\w]/g, '').toLowerCase()", 'const mapA = charMap(clean(a)), mapB = charMap(clean(b));', 'if (Object.keys(mapA).length !== Object.keys(mapB).length) return false;', 'for (let char in mapA) {', '  if (mapA[char] !== mapB[char]) return false;', '}', 'return true;'],
      input: { label: 'A | B', value: 'rail safety | fairy tales', presets: ['rail safety | fairy tales', 'hello | hellos', 'RAIL! SAFETY! | fairy tales'], hint: 'คั่นข้อความ 2 ชุดด้วย |' }, build: anagram,
    },
  ],
};
