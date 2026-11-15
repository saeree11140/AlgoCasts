// Group 03 "Loop & Recursion": steps, pyramid, spiral matrix and chunk, cell by cell.
import { esc, parseInteger, parseNumbers, randomInt, type Frame, type LabSpec } from './engine';

type Cell = { text: string; cls?: string };
const grid = (rows: Cell[][], cols: number, labels = true) => `<div class="grid-board" style="--cols:${cols}">${labels ? `<span></span>${Array.from({ length: cols }, (_, c) => `<span class="axis">c${c}</span>`).join('')}` : ''}${rows.map((row, r) => `${labels ? `<span class="axis">r${r}</span>` : ''}${row.map(cell => `<span class="grid-cell ${cell.cls ?? ''}">${esc(cell.text)}</span>`).join('')}`).join('')}</div>`;

function steps(text: string): Frame[] | string {
  const n = parseInteger(text, 1, 6);
  if (typeof n === 'string') return n;
  const board: Cell[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => ({ text: '' })));
  const frames: Frame[] = [{ html: grid(board, n), message: `n = ${n}: วาด ${n} แถว แต่ละแถวกว้าง ${n} ช่อง`, line: 0 }];
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const hash = col <= row;
      board[row][col] = { text: hash ? '#' : '·', cls: 'is-active' };
      frames.push({ html: grid(board, n), message: `แถว ${row} คอลัมน์ ${col}: ${col} ${hash ? '<=' : '>'} ${row} → ${hash ? "เติม '#'" : 'เติมช่องว่าง'}`, line: hash ? 3 : 4 });
      board[row][col].cls = hash ? 'is-done' : '';
    }
    frames.push({ html: grid(board, n), message: `จบแถว ${row}: console.log('${board[row].map(c => (c.text === '#' ? '#' : ' ')).join('')}')`, line: 6 });
  }
  return frames;
}

function pyramid(text: string): Frame[] | string {
  const n = parseInteger(text, 1, 5);
  if (typeof n === 'string') return n;
  const cols = 2 * n - 1, mid = Math.floor(cols / 2);
  const board: Cell[][] = Array.from({ length: n }, () => Array.from({ length: cols }, () => ({ text: '' })));
  const frames: Frame[] = [{ html: grid(board, cols), message: `n = ${n}: แต่ละแถวกว้าง 2n - 1 = ${cols} ช่อง จุดกึ่งกลางคือคอลัมน์ ${mid}`, line: 0 }];
  for (let row = 0; row < n; row++) {
    frames.push({ html: grid(board, cols), message: `แถว ${row}: เติม '#' ตั้งแต่คอลัมน์ ${mid - row} ถึง ${mid + row} (กลาง ± ${row})`, line: 2 });
    for (let col = 0; col < cols; col++) {
      const hash = mid - row <= col && col <= mid + row;
      board[row][col] = { text: hash ? '#' : '·', cls: hash ? 'is-done' : '' };
    }
    frames.push({ html: grid(board, cols), message: `console.log('${board[row].map(c => (c.text === '#' ? '#' : ' ')).join('')}')`, line: 6 });
  }
  return frames;
}

function spiral(text: string): Frame[] | string {
  const n = parseInteger(text, 1, 5);
  if (typeof n === 'string') return n;
  const m: (number | null)[][] = Array.from({ length: n }, () => Array(n).fill(null));
  let counter = 1, startRow = 0, endRow = n - 1, startCol = 0, endCol = n - 1;
  const frames: Frame[] = [];
  const stage = (hot?: [number, number]) => {
    const rows = m.map((row, r) => row.map((v, c) => {
      const edge = r === startRow || r === endRow || c === startCol || c === endCol;
      const inside = r >= startRow && r <= endRow && c >= startCol && c <= endCol;
      return { text: v === null ? '' : String(v), cls: hot && hot[0] === r && hot[1] === c ? 'is-new' : v !== null ? 'is-done' : inside && edge ? 'is-range' : '' };
    }));
    return grid(rows, n) + `<p class="lab-note">startRow=${startRow} · endRow=${endRow} · startCol=${startCol} · endCol=${endCol}</p>`;
  };
  frames.push({ html: stage(), message: 'ขอบที่ยังไม่ได้เติมเป็นสีน้ำเงิน เติมตามเข็มนาฬิกา แล้วหดขอบเข้าไปทีละชั้น', line: 0 });
  while (startCol <= endCol && startRow <= endRow) {
    for (let i = startCol; i <= endCol; i++) { m[startRow][i] = counter++; frames.push({ html: stage([startRow, i]), message: `ขอบบน: results[${startRow}][${i}] = ${counter - 1}`, line: 1 }); }
    startRow++;
    frames.push({ html: stage(), message: `เติมขอบบนครบ → startRow++ (= ${startRow})`, line: 2 });
    for (let i = startRow; i <= endRow; i++) { m[i][endCol] = counter++; frames.push({ html: stage([i, endCol]), message: `ขอบขวา: results[${i}][${endCol}] = ${counter - 1}`, line: 3 }); }
    endCol--;
    frames.push({ html: stage(), message: `เติมขอบขวาครบ → endCol-- (= ${endCol})`, line: 4 });
    if (startRow <= endRow) {
      for (let i = endCol; i >= startCol; i--) { m[endRow][i] = counter++; frames.push({ html: stage([endRow, i]), message: `ขอบล่าง (ขวาไปซ้าย): results[${endRow}][${i}] = ${counter - 1}`, line: 5 }); }
      endRow--;
      frames.push({ html: stage(), message: `เติมขอบล่างครบ → endRow-- (= ${endRow})`, line: 6 });
    }
    if (startCol <= endCol) {
      for (let i = endRow; i >= startRow; i--) { m[i][startCol] = counter++; frames.push({ html: stage([i, startCol]), message: `ขอบซ้าย (ล่างขึ้นบน): results[${i}][${startCol}] = ${counter - 1}`, line: 7 }); }
      startCol++;
      frames.push({ html: stage(), message: `เติมขอบซ้ายครบ → startCol++ (= ${startCol})`, line: 8 });
    }
  }
  frames.push({ html: stage(), message: `เติมครบ ${n * n} ช่อง ขอบไขว้กันแล้ว (start > end) จึงออกจาก while`, line: 9 });
  return frames;
}

function chunk(text: string): Frame[] | string {
  const [listText = '', sizeText = ''] = text.split('|');
  const values = parseNumbers(listText, 1, 12);
  if (typeof values === 'string') return values;
  const size = parseInteger(sizeText, 1, 6);
  if (typeof size === 'string') return `ขนาด chunk: ${size} (เขียนต่อท้ายหลัง | เช่น 1,2,3,4,5 | 2)`;
  const chunked: number[][] = [], frames: Frame[] = [];
  const stage = (index: number) => `<div class="cells">${values.map((v, i) => `<div class="cell ${i >= index && i < index + size ? 'is-active' : i < index ? 'is-muted' : ''}"><b>${v}</b><small>${i}</small></div>`).join('')}</div><div class="chunks">${chunked.map((c, i) => `<div class="${i === chunked.length - 1 ? 'is-new' : ''}">[${c.join(', ')}]</div>`).join('') || '<em>chunked = []</em>'}</div>`;
  frames.push({ html: stage(-1), message: `แบ่งทีละ ${size} ตัว เริ่ม index = 0`, line: 1 });
  for (let index = 0; index < values.length; index += size) {
    chunked.push(values.slice(index, index + size));
    frames.push({ html: stage(index), message: `array.slice(${index}, ${index + size}) → [${chunked.at(-1)!.join(', ')}] แล้ว index += ${size}`, line: 3 });
  }
  frames.push({ html: stage(values.length), message: `index = ${Math.ceil(values.length / size) * size} ไม่น้อยกว่า length (${values.length}) จึงหยุด · ได้ ${chunked.length} กลุ่ม${values.length % size ? ' กลุ่มสุดท้ายสั้นกว่าเพราะของไม่พอ' : ''}`, line: 6 });
  return frames;
}

export const loopsLab: LabSpec = {
  id: 'loops',
  title: 'Loop Lab',
  description: 'ปรับค่า n แล้วดูทีละช่องว่า loop ซ้อนเลือกเติมอะไร ช่วยให้เห็นเงื่อนไขของแถวและคอลัมน์',
  legend: [['k-range', 'ขอบที่กำลังเดิน / ช่วงที่หยิบ', ['matrix', 'chunk']], ['k-write', 'เพิ่งเติม', ['matrix', 'steps']], ['k-sorted', 'เติม # แล้ว / เสร็จ', ['steps', 'pyramid', 'matrix']]],
  modes: [
    {
      id: 'steps', label: 'Steps', complexity: 'O(n²)',
      code: ['for (let row = 0; row < n; row++) {', "  let stair = '';", '  for (let column = 0; column < n; column++) {', "    if (column <= row) stair += '#';", "    else stair += ' ';", '  }', '  console.log(stair);', '}'],
      input: { label: 'n', value: '3', presets: ['3', '5'], random: () => String(randomInt(2, 6)), hint: '1–6' }, build: steps,
    },
    {
      id: 'pyramid', label: 'Pyramid', complexity: 'O(n²)',
      code: ['const midpoint = Math.floor((2 * n - 1) / 2);', 'for (let row = 0; row < n; row++) {', "  let level = '';", '  for (let column = 0; column < 2 * n - 1; column++) {', "    level += midpoint - row <= column && column <= midpoint + row ? '#' : ' ';", '  }', '  console.log(level);', '}'],
      input: { label: 'n', value: '3', presets: ['3', '4'], random: () => String(randomInt(2, 5)), hint: '1–5' }, build: pyramid,
    },
    {
      id: 'matrix', label: 'Spiral Matrix', complexity: 'O(n²)',
      code: ['while (startColumn <= endColumn && startRow <= endRow) {', '  for (i = startColumn; i <= endColumn; i++) results[startRow][i] = counter++;', '  startRow++;', '  for (i = startRow; i <= endRow; i++) results[i][endColumn] = counter++;', '  endColumn--;', '  for (i = endColumn; i >= startColumn; i--) results[endRow][i] = counter++;', '  endRow--;', '  for (i = endRow; i >= startRow; i--) results[i][startColumn] = counter++;', '  startColumn++;', '}'],
      input: { label: 'n', value: '4', presets: ['3', '4', '5'], random: () => String(randomInt(2, 5)), hint: '1–5' }, build: spiral,
    },
    {
      id: 'chunk', label: 'Chunk', complexity: 'O(n)',
      code: ['const chunked = [];', 'let index = 0;', 'while (index < array.length) {', '  chunked.push(array.slice(index, index + size));', '  index += size;', '}', 'return chunked;'],
      input: { label: 'array | size', value: '1, 2, 3, 4, 5 | 2', presets: ['1, 2, 3, 4, 5 | 2', '1, 2, 3, 4, 5, 6, 7, 8 | 3'], hint: 'ตัวเลขคั่นด้วย comma แล้วตามด้วย | ขนาด chunk' }, build: chunk,
    },
  ],
};
