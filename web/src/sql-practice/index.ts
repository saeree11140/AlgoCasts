import {MySQL, sql} from '@codemirror/lang-sql';
import type {SqlValue} from 'sql.js';
import {mountEditor} from '../editor';
import type {SqlProgress} from '../types';
import {datasetFor, exercises as allExercises, sqlMaxLength, type Dataset} from './exercises';
import type {SqlReply, SqlRequest} from './sql-worker';
import './practice.css';

const languageFor = (dataset: Dataset) => sql({
  dialect: MySQL,
  schema: Object.fromEntries(Object.entries(dataset.tables).map(([table, columns]) => [table, columns.map(column => column.name)])),
});
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

export function mountSqlPractice(root: HTMLElement, progress: Record<string, SqlProgress>, save: () => boolean, options: {exerciseId?: string} = {}) {
  // Single mode shows one exercise as a standalone problem (used by #/problem/<id>).
  const single = options.exerciseId !== undefined;
  const exercises = single ? allExercises.filter(exercise => exercise.id === options.exerciseId) : allExercises;
  if (!exercises.length) throw new Error('ไม่พบโจทย์ SQL นี้');
  root.innerHTML = `
    <section class="sql-practice${single ? ' sql-single' : ''}" aria-labelledby="sql-practice-title">
      <header class="sql-practice-heading" ${single ? 'hidden' : ''}>
        <div>
          <h2 id="sql-practice-title">แบบฝึกเขียน SQL</h2>
          <p class="muted">ใช้ข้อมูลจำลองและ SQLite ในเบราว์เซอร์ โจทย์ใช้ไวยากรณ์ที่ใช้ร่วมกับ MySQL 8</p>
        </div>
        <span class="sql-progress" data-sql-progress></span>
      </header>
      <div class="sql-workspace">
        <div class="sql-question">
          <label for="sql-question-picker" ${single ? 'hidden' : ''}>เลือกโจทย์</label>
          <select id="sql-question-picker" ${single ? 'hidden' : ''}></select>
          <div class="sql-prompt" data-sql-prompt></div>
          <details class="sql-disclosure" data-sql-hint>
            <summary>ดูคำใบ้</summary>
            <p></p>
          </details>
          <details class="sql-disclosure" data-sql-schema-box ${single ? 'open' : ''}>
            <summary>ดูตารางและข้อมูลตัวอย่าง</summary>
            <div class="sql-schema" data-sql-schema></div>
          </details>
          ${single ? `<details class="sql-disclosure" data-sql-solution>
            <summary>ดูเฉลย</summary>
            <pre><code></code></pre>
          </details>` : ''}
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
  const solution = root.querySelector<HTMLDetailsElement>('[data-sql-solution]');
  picker.replaceChildren(...exercises.map(exercise => new Option('', exercise.id)));

  function showSchema(dataset: Dataset, sampleOutput?: SqlValue[][], columns: string[] = []) {
    schema.replaceChildren();
    const sample = dataset.cases[0].rows;
    for (const [name, tableColumns] of Object.entries(dataset.tables)) {
      if (tableColumns.some(column => column.note)) {
        schema.append(resultTable(`Table: ${name}`, ['Column', 'Type', 'Description'],
          tableColumns.map(column => [column.name, column.type, column.note ?? ''])));
      }
      schema.append(resultTable(single ? `Sample Input · ${name}` : name, tableColumns.map(column => column.name), sample[name] ?? []));
    }
    if (sampleOutput) schema.append(resultTable('Expected Output', columns, sampleOutput));
  }

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
    const cases = datasetFor(exercises[picker.selectedIndex]).cases.length;
    showStatus(`รันตัวอย่างเพื่อดูผลลัพธ์ หรือตรวจคำตอบกับชุดทดสอบ ${cases} ชุด`);
  }

  function showQuestion() {
    endRun();
    editor?.destroy();
    const exercise = exercises[picker.selectedIndex];
    const dataset = datasetFor(exercise);
    prompt.innerHTML = `
      <p class="sql-topic">${exercise.topic}</p>
      ${single ? '' : `<h3>${exercise.title}</h3>`}
      <p>${exercise.prompt}</p>
      ${exercise.requirements ? `<ul class="sql-requirements">${exercise.requirements.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}
      <p class="sql-expected-columns">คืนคอลัมน์ตามลำดับ ${exercise.columns.map(name => `<code>${name}</code>`).join(' ')}</p>`;
    hint.open = false;
    hint.querySelector('p')!.textContent = exercise.hint;
    if (solution) {
      solution.open = false;
      solution.querySelector('code')!.textContent = exercise.solution;
    }
    showSchema(dataset, exercise.sampleOutput, exercise.columns);
    editor = mountEditor(editorHost, progress[exercise.id]?.code ?? starter, code => {
      endRun();
      clearResults();
      (progress[exercise.id] ??= {}).code = code.slice(0, sqlMaxLength);
      saveStatus.textContent = save() ? '' : 'บันทึกในเบราว์เซอร์ไม่ได้';
    }, {language: languageFor(dataset), label: 'ตัวแก้ไขคำตอบ SQL'});
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
          if (data.labels && data.checks.length > 2) {
            const list = document.createElement('ul');
            list.className = 'sql-case-results';
            data.checks.forEach((ok, i) => {
              const item = document.createElement('li');
              item.className = ok ? 'green-text' : 'red-text';
              item.textContent = `${ok ? '✓' : '×'} ชุดที่ ${i + 1}: ${data.labels![i]}`;
              list.append(item);
            });
            output.prepend(list);
          }
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
