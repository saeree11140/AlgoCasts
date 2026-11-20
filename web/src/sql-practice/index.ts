import {MySQL, sql} from '@codemirror/lang-sql';
import type {SqlValue} from 'sql.js';
import {mountEditor} from '../editor';
import type {SqlProgress} from '../types';
import {exercises, fixtures, sqlMaxLength, tables} from './exercises';
import type {SqlReply, SqlRequest} from './sql-worker';
import './practice.css';

const language = sql({dialect: MySQL, schema: tables});
const starter = '-- เขียนคำตอบ SQL ตรงนี้\n';

function resultTable(title: string, columns: readonly string[], rows: readonly SqlValue[][]) {
  const group = document.createElement('div');
  group.className = 'sql-table-wrap';
  const table = document.createElement('table');
  table.createCaption().textContent = title;
  const headings = table.createTHead().insertRow();
  for (const column of columns) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = column;
    headings.append(th);
  }
  const body = table.createTBody();
  for (const row of rows) {
    const line = body.insertRow();
    for (const value of row) {
      const cell = line.insertCell();
      if (value === null) {
        cell.textContent = 'NULL';
        cell.className = 'sql-null';
      } else if (value instanceof Uint8Array) {
        cell.textContent = 'BLOB (' + value.length + ' ไบต์)';
      } else {
        cell.textContent = String(value);
      }
    }
  }
  if (rows.length === 0) {
    const cell = body.insertRow().insertCell();
    cell.colSpan = columns.length;
    cell.textContent = 'ไม่มีแถวในผลลัพธ์';
  }
  group.append(table);
  return group;
}

export function mountSqlPractice(root: HTMLElement, progress: Record<string, SqlProgress>, save: () => boolean) {
  root.innerHTML = `
    <section class="sql-practice" aria-labelledby="sql-practice-title">
      <header class="sql-practice-heading">
        <div>
          <h2 id="sql-practice-title">แบบฝึกเขียน SQL</h2>
          <p class="muted">ใช้ข้อมูลจำลองและ SQLite ในเบราว์เซอร์ โจทย์ใช้ไวยากรณ์ที่ใช้ร่วมกับ MySQL 8</p>
        </div>
        <span class="sql-progress" data-sql-progress></span>
      </header>
      <div class="sql-workspace">
        <div class="sql-question">
          <label for="sql-question-picker">เลือกโจทย์</label>
          <select id="sql-question-picker"></select>
          <div class="sql-prompt" data-sql-prompt></div>
          <details class="sql-disclosure" data-sql-hint>
            <summary>ดูคำใบ้</summary>
            <p></p>
          </details>
          <details class="sql-disclosure">
            <summary>ดูตารางและข้อมูลตัวอย่าง</summary>
            <div class="sql-schema" data-sql-schema></div>
          </details>
        </div>
        <div class="sql-answer">
          <div class="sql-editor-head">
            <h3>คำตอบ SQL</h3>
            <small class="red-text" data-sql-save role="status"></small>
          </div>
          <div class="sql-editor" data-sql-editor></div>
          <div class="sql-actions button-row">
            <button type="button" class="button" data-sql-run>รันตัวอย่าง</button>
            <button type="button" class="button primary" data-sql-check>ตรวจคำตอบ</button>
            <button type="button" class="button" data-sql-stop hidden>หยุดรัน</button>
          </div>
          <div class="sql-results">
            <h3>ผลลัพธ์</h3>
            <p role="status" data-sql-status></p>
            <div class="sql-output" data-sql-output></div>
          </div>
        </div>
      </div>
    </section>`;

  const picker = root.querySelector<HTMLSelectElement>('#sql-question-picker')!;
  const prompt = root.querySelector<HTMLElement>('[data-sql-prompt]')!;
  const hint = root.querySelector<HTMLDetailsElement>('[data-sql-hint]')!;
  const schema = root.querySelector<HTMLElement>('[data-sql-schema]')!;
  const progressLabel = root.querySelector<HTMLElement>('[data-sql-progress]')!;
  const editorHost = root.querySelector<HTMLElement>('[data-sql-editor]')!;
  const saveStatus = root.querySelector<HTMLElement>('[data-sql-save]')!;
  const runButton = root.querySelector<HTMLButtonElement>('[data-sql-run]')!;
  const checkButton = root.querySelector<HTMLButtonElement>('[data-sql-check]')!;
  const stopButton = root.querySelector<HTMLButtonElement>('[data-sql-stop]')!;
  const status = root.querySelector<HTMLElement>('[data-sql-status]')!;
  const output = root.querySelector<HTMLElement>('[data-sql-output]')!;
  const sample = fixtures[0];
  for (const name of ['departments', 'employees'] as const) {
    schema.append(resultTable(name, tables[name], sample[name]));
  }
  picker.replaceChildren(...exercises.map(exercise => new Option('', exercise.id)));

  let editor: ReturnType<typeof mountEditor>;
  let activeWorker: Worker | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function showProgress() {
    const solved = exercises.filter(exercise => progress[exercise.id]?.solved).length;
    progressLabel.textContent = `ผ่านแล้ว ${solved} / ${exercises.length} ข้อ`;
    exercises.forEach((exercise, index) => {
      picker.options[index].text = `${index + 1}. ${exercise.title}${progress[exercise.id]?.solved ? ' (ผ่านแล้ว)' : ''}`;
    });
  }

  function showStatus(message: string, tone = 'muted') {
    status.textContent = message;
    status.className = tone;
  }

  function endRun() {
    clearTimeout(timer);
    activeWorker?.terminate();
    activeWorker = undefined;
    runButton.disabled = checkButton.disabled = false;
    stopButton.hidden = true;
  }

  function clearResults() {
    output.replaceChildren();
    showStatus('รันตัวอย่างเพื่อดูผลลัพธ์ หรือตรวจคำตอบกับชุดทดสอบ 2 ชุด');
  }

  function showQuestion() {
    endRun();
    editor?.destroy();
    const exercise = exercises[picker.selectedIndex];
    prompt.innerHTML = `
      <p class="sql-topic">${exercise.topic}</p>
      <h3>${exercise.title}</h3>
      <p>${exercise.prompt}</p>
      <p class="sql-expected-columns">คืนคอลัมน์ตามลำดับ ${exercise.columns.map(name => `<code>${name}</code>`).join(' ')}</p>`;
    hint.open = false;
    hint.querySelector('p')!.textContent = exercise.hint;
    editor = mountEditor(editorHost, progress[exercise.id]?.code ?? starter, code => {
      endRun();
      clearResults();
      (progress[exercise.id] ??= {}).code = code.slice(0, sqlMaxLength);
      saveStatus.textContent = save() ? '' : 'บันทึกในเบราว์เซอร์ไม่ได้';
    }, {language, label: 'ตัวแก้ไขคำตอบ SQL'});
    clearResults();
  }

  function execute(check: boolean) {
    const exercise = exercises[picker.selectedIndex];
    const query = editor.state.doc.toString();
    output.replaceChildren();
    if (query.trim() === starter.trim() || !query.trim()) {
      showStatus('เขียนคำสั่ง SQL ก่อนรัน', 'red-text');
      editor.focus();
      return;
    }
    if (query.length > sqlMaxLength) {
      showStatus('คำสั่ง SQL ยาวเกิน 12,000 ตัวอักษร', 'red-text');
      return;
    }
    runButton.disabled = checkButton.disabled = true;
    stopButton.hidden = false;
    showStatus(check ? 'กำลังตรวจคำตอบ…' : 'กำลังรันตัวอย่าง…');
    try {
      const worker = new Worker(new URL('./sql-worker.ts', import.meta.url), {type: 'module'});
      activeWorker = worker;
      timer = setTimeout(() => {
        endRun();
        showStatus('ใช้เวลารันเกิน 8 วินาที ลองปรับคำสั่งแล้วรันใหม่', 'red-text');
      }, 8_000);
      worker.onmessage = ({data}: MessageEvent<SqlReply>) => {
        if (activeWorker !== worker) return;
        endRun();
        if ('error' in data) {
          showStatus(`รัน SQL ไม่สำเร็จ · ${data.error}`, 'red-text');
          return;
        }
        output.append(resultTable('ผลลัพธ์ของคุณ · ข้อมูลตัวอย่าง', data.actual.columns, data.actual.values));
        if (data.expected && data.checks) {
          const passed = data.checks.filter(Boolean).length;
          if (passed === data.checks.length) {
            (progress[exercise.id] ??= {}).solved = true;
            saveStatus.textContent = save() ? '' : 'บันทึกในเบราว์เซอร์ไม่ได้';
            showProgress();
            showStatus(`ผ่าน ${passed} / ${data.checks.length} ชุดทดสอบ`, 'green-text');
          } else {
            const feedback = data.checks[0]
              ? 'ผลตัวอย่างถูกต้อง ลองตรวจเงื่อนไขเมื่อข้อมูลเปลี่ยน'
              : 'ลองเทียบค่า จำนวนคอลัมน์ และลำดับแถวกับผลลัพธ์ที่คาดหวัง';
            showStatus(`ผ่าน ${passed} / ${data.checks.length} ชุดทดสอบ · ${feedback}`, 'red-text');
            output.append(resultTable('ผลลัพธ์ที่คาดหวัง · ข้อมูลตัวอย่าง', data.expected.columns, data.expected.values));
          }
        } else {
          showStatus(`รันตัวอย่างสำเร็จ · ${data.actual.values.length} แถว`, 'green-text');
        }
      };
      worker.onerror = () => {
        if (activeWorker !== worker) return;
        endRun();
        showStatus('เปิดตัวรัน SQL ไม่สำเร็จ ลองโหลดหน้าใหม่', 'red-text');
      };
      worker.postMessage({id: exercise.id, query, check} satisfies SqlRequest);
    } catch {
      endRun();
      showStatus('เปิดตัวรัน SQL ไม่สำเร็จ ลองโหลดหน้าใหม่', 'red-text');
    }
  }

  picker.addEventListener('change', showQuestion);
  runButton.addEventListener('click', () => execute(false));
  checkButton.addEventListener('click', () => execute(true));
  stopButton.addEventListener('click', () => {
    endRun();
    showStatus('หยุดรัน SQL แล้ว');
  });
  showProgress();
  showQuestion();
  root.removeAttribute('aria-busy');

  return () => {
    endRun();
    editor.destroy();
  };
}
