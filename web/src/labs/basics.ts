// Group 01 "เริ่มต้นแก้โจทย์": FizzBuzz and the loop version of Fibonacci.
import { parseInteger, randomInt, type Frame, type LabSpec } from './engine';

function fizzbuzz(text: string): Frame[] | string {
  const n = parseInteger(text, 1, 45);
  if (typeof n === 'string') return n;
  const said: string[] = [];
  const word = (i: number) => (i % 15 === 0 ? 'fizzbuzz' : i % 3 === 0 ? 'fizz' : i % 5 === 0 ? 'buzz' : String(i));
  const grid = (current: number) => `<div class="fizz-grid">${Array.from({ length: n }, (_, k) => {
    const i = k + 1, w = word(i), shown = i <= said.length;
    return `<div class="fizz-cell ${shown ? `is-${/^\d/.test(w) ? 'num' : w}` : ''} ${i === current ? 'is-current' : ''}"><small>${i}</small><b>${shown ? w : ''}</b></div>`;
  }).join('')}</div>`;
  const frames: Frame[] = [{ html: grid(0), message: `พิมพ์ 1 ถึง ${n} · พหุคูณ 3 → fizz, พหุคูณ 5 → buzz, พหุคูณทั้งคู่ → fizzbuzz`, line: -1 }];
  for (let i = 1; i <= n; i++) {
    const w = word(i);
    const line = w === 'fizzbuzz' ? 2 : w === 'fizz' ? 4 : w === 'buzz' ? 6 : 7;
    const why = w === 'fizzbuzz' ? `${i} % 3 === 0 และ ${i} % 5 === 0 → ต้องเช็กกรณีนี้ก่อน ไม่งั้นจะได้แค่ fizz`
      : w === 'fizz' ? `${i} % 3 === 0 → fizz` : w === 'buzz' ? `${i} % 5 === 0 (แต่หาร 3 ไม่ลงตัว) → buzz` : `${i} หาร 3 และ 5 ไม่ลงตัว → พิมพ์ตัวเลข`;
    said.push(w);
    frames.push({ html: grid(i), message: why, line, stats: [['fizz', said.filter(x => x === 'fizz').length], ['buzz', said.filter(x => x === 'buzz').length], ['fizzbuzz', said.filter(x => x === 'fizzbuzz').length]] });
  }
  return frames;
}

function fibLoop(text: string): Frame[] | string {
  const n = parseInteger(text, 1, 20);
  if (typeof n === 'string') return n;
  const result = [0, 1];
  const row = (active: number) => `<div class="cells">${result.map((v, i) => `<div class="cell ${i === active ? 'is-new' : i === active - 1 || i === active - 2 ? 'is-compare' : ''}"><b>${v}</b><small>${i}</small></div>`).join('')}</div>`;
  const frames: Frame[] = [{ html: row(-1), message: 'เริ่มจาก result = [0, 1] คือ fib(0) และ fib(1)', line: 0, stats: [['รอบ loop', 0]] }];
  for (let i = 2; i <= n; i++) {
    const a = result[i - 1], b = result[i - 2];
    result.push(a + b);
    frames.push({ html: row(i), message: `fib(${i}) = result[${i - 1}] + result[${i - 2}] = ${a} + ${b} = ${a + b}`, line: 3, stats: [['รอบ loop', i - 1]] });
  }
  frames.push({ html: row(n), message: `คืน result[${n}] = ${result[n]} · ใช้ loop ${Math.max(0, n - 1)} รอบ เป็น O(n) ต่างจาก recursion ที่เรียกซ้ำเป็น O(2ⁿ)`, line: 5, stats: [['รอบ loop', Math.max(0, n - 1)]] });
  return frames;
}

export const basicsLab: LabSpec = {
  id: 'basics',
  title: 'Warm-up Lab',
  description: 'ลองโจทย์คลาสสิกที่มักเจอในรอบแรกของการสัมภาษณ์ ดูทีละรอบว่าเงื่อนไขไหนทำงาน',
  legend: [['k-fizz', 'fizz (หาร 3 ลงตัว)', ['fizzbuzz']], ['k-buzz', 'buzz (หาร 5 ลงตัว)', ['fizzbuzz']], ['k-fizzbuzz', 'fizzbuzz (หาร 15 ลงตัว)', ['fizzbuzz']], ['k-compare', 'สองค่าก่อนหน้า', ['fib']], ['k-write', 'ค่าใหม่', ['fib']]],
  modes: [
    {
      id: 'fizzbuzz', label: 'FizzBuzz', complexity: 'O(n)',
      code: ['for (let i = 1; i <= n; i++) {', "  if (i % 3 === 0 && i % 5 === 0) {", "    console.log('fizzbuzz');", '  } else if (i % 3 === 0) {', "    console.log('fizz');", '  } else if (i % 5 === 0) {', "    console.log('buzz');", '  } else console.log(i);', '}'],
      input: { label: 'n', value: '15', presets: ['15', '30'], random: () => String(randomInt(10, 45)), hint: 'จำนวนเต็ม 1–45' },
      build: fizzbuzz,
    },
    {
      id: 'fib', label: 'Fibonacci (loop)', complexity: 'O(n)',
      code: ['const result = [0, 1];', 'for (let i = 2; i <= n; i++) {', '  const a = result[i - 1], b = result[i - 2];', '  result.push(a + b);', '}', 'return result[n];'],
      input: { label: 'n', value: '8', presets: ['8', '15'], random: () => String(randomInt(3, 20)), hint: 'จำนวนเต็ม 1–20' },
      build: fibLoop,
    },
  ],
};
