// Step-player shared by every interactive lab on the guides page.
// A lab mode turns the text in its input box into a list of frames; the player only moves an index,
// so stepping backwards is free and every frame is reproducible from the input alone.

export interface Frame {
  /** Stage markup for this step. Escape anything that came from the user with `esc`. */
  html: string;
  /** One-sentence Thai explanation, read out to screen readers. */
  message: string;
  /** 0-based line of `code` to highlight, -1 or undefined for none. */
  line?: number;
  stats?: [string, string | number][];
}

export interface LabAction {
  label: string;
  /** Appended to the input as `${op} ${value}` (or just `op` when `value` is false). */
  op: string;
  value?: boolean;
}

export interface LabMode {
  id: string;
  label: string;
  code: string[];
  complexity?: string;
  input?: { label: string; value: string; hint?: string; presets?: string[]; random?: () => string };
  /** Playground buttons. When present, the input is an operation script separated by commas. */
  actions?: LabAction[];
  build(input: string): Frame[] | string;
}

export interface LabSpec {
  id: string;
  title: string;
  description: string;
  modes: LabMode[];
  /** [css class of the swatch, label, optional list of mode ids it applies to] */
  legend?: [string, string, string[]?][];
}

export const esc = (value: unknown) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/** Splits an operation script ("add 1, add 2, remove") into [op, ...args] tuples. */
export function parseOps(script: string): string[][] {
  return script.split(/[,\n;]+/).map(part => part.trim().split(/\s+/).filter(Boolean)).filter(part => part.length);
}

export function labHtml(spec: LabSpec): string {
  const legend = (spec.legend ?? []).map(([cls, label, modes]) => `<li ${modes ? `data-modes="${modes.join(' ')}"` : ''}><i class="${cls}"></i>${esc(label)}</li>`).join('');
  return `<section class="lab panel" id="guide-lab" aria-labelledby="lab-title">
  <div class="lab-head"><div><p class="eyebrow">INTERACTIVE</p><h2 id="lab-title">${esc(spec.title)}</h2><p class="muted">${esc(spec.description)}</p></div>
   <div class="lab-tabs" role="tablist" aria-label="เลือกหัวข้อ">${spec.modes.map(mode => `<button class="button" role="tab" data-mode="${mode.id}">${esc(mode.label)}</button>`).join('')}</div></div>
  <div class="lab-input" id="lab-input-row"><label for="lab-input" id="lab-input-label"></label><input id="lab-input" autocomplete="off" spellcheck="false"><button class="button" id="lab-apply">ใช้ค่านี้</button><button class="button" id="lab-random">สุ่ม</button><span class="lab-presets" id="lab-presets"></span>
   <span class="lab-actions" id="lab-actions"><input id="lab-value" aria-label="ค่าที่จะใส่" placeholder="ค่า" autocomplete="off"><span id="lab-action-buttons"></span><button class="button" id="lab-clear">ล้าง</button></span>
   <p class="lab-hint" id="lab-hint"></p><p class="lab-error" id="lab-error" role="alert"></p></div>
  <div class="lab-body">
   <div class="lab-main"><div class="lab-stage" id="lab-stage"></div>
    <p class="lab-message" id="lab-message" aria-live="polite"></p>
    <div class="lab-controls"><button class="button" id="lab-reset" aria-label="กลับไปจุดเริ่มต้น">⏮</button><button class="button" id="lab-back">◀ ย้อน</button><button class="button primary" id="lab-play">▶ เล่น</button><button class="button" id="lab-next">ถัดไป ▶</button>
     <label class="lab-speed">ความเร็ว<input type="range" id="lab-speed" min="1" max="5" value="3"></label><output id="lab-progress"></output></div>
    <div class="lab-stats" id="lab-stats"></div>
    ${legend ? `<ul class="lab-legend" id="lab-legend">${legend}</ul>` : ''}
   </div>
   <ol class="lab-code" id="lab-code" aria-label="โค้ด"></ol>
  </div>
 </section>`;
}

/** Wires up markup from labHtml(). The timer stops by itself once the lab leaves the document. */
export function mountLab(root: HTMLElement, spec: LabSpec, initialMode?: string) {
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const input = $<HTMLInputElement>('#lab-input'), value = $<HTMLInputElement>('#lab-value'), error = $('#lab-error');
  const play = $<HTMLButtonElement>('#lab-play'), speed = $<HTMLInputElement>('#lab-speed');
  const inputs = new Map<string, string>(spec.modes.map(mode => [mode.id, mode.input?.value ?? '']));
  let mode = spec.modes.find(m => m.id === initialMode) ?? spec.modes[0];
  let frames: Frame[] = [], index = 0, timer: number | undefined;

  const stop = () => { if (timer !== undefined) clearInterval(timer); timer = undefined; play.textContent = '▶ เล่น'; };
  const delay = () => [1500, 1000, 700, 400, 180][Number(speed.value) - 1] ?? 700;
  const start = () => {
    if (index >= frames.length - 1) index = 0;
    stop();
    timer = window.setInterval(() => {
      if (!root.isConnected || index >= frames.length - 1) return stop();
      index++; draw();
    }, delay());
    play.textContent = '⏸ หยุด';
    draw();
  };

  function build(text: string): boolean {
    const result = mode.build(text);
    if (typeof result === 'string') { error.textContent = result; input.setAttribute('aria-invalid', 'true'); return false; }
    if (!result.length) { error.textContent = 'ไม่มีขั้นตอนให้แสดง'; return false; }
    error.textContent = ''; input.removeAttribute('aria-invalid');
    frames = result; inputs.set(mode.id, text); input.value = text;
    return true;
  }

  function selectMode(id: string) {
    stop();
    mode = spec.modes.find(m => m.id === id) ?? spec.modes[0];
    root.dataset.mode = mode.id;
    root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b => { const on = b.dataset.mode === mode.id; b.classList.toggle('primary', on); b.setAttribute('aria-selected', String(on)); });
    root.querySelectorAll<HTMLElement>('#lab-legend li').forEach(li => { li.hidden = !!li.dataset.modes && !li.dataset.modes.split(' ').includes(mode.id); });
    const config = mode.input;
    $('#lab-input-row').hidden = !config;
    $('#lab-input-label').textContent = config?.label ?? '';
    $('#lab-hint').textContent = config?.hint ?? '';
    $('#lab-random').hidden = !config?.random;
    $('#lab-presets').innerHTML = (config?.presets ?? []).map((preset, i) => `<button class="button lab-preset" data-preset="${i}" title="${esc(preset)}">${preset.length > 28 ? 'ตัวอย่าง' : esc(preset)}</button>`).join('');
    $('#lab-actions').hidden = !mode.actions;
    $('#lab-action-buttons').innerHTML = (mode.actions ?? []).map((action, i) => `<button class="button" data-action="${i}">${esc(action.label)}</button>`).join('');
    $('#lab-code').innerHTML = mode.code.map(line => `<li><code>${esc(line)}</code></li>`).join('');
    error.textContent = '';
    if (!build(inputs.get(mode.id) ?? '')) build(mode.input?.value ?? '');
    index = 0;
    draw();
  }

  function draw() {
    const frame = frames[index];
    $('#lab-stage').innerHTML = frame.html;
    $('#lab-message').textContent = frame.message;
    $('#lab-code').querySelectorAll('li').forEach((li, i) => li.classList.toggle('active', i === frame.line));
    $('#lab-stats').innerHTML = [...(frame.stats ?? []), ...(mode.complexity ? [['Big O', mode.complexity] as [string, string]] : [])].map(([k, v]) => `<span>${esc(k)} <strong>${esc(v)}</strong></span>`).join('');
    $('#lab-progress').textContent = `ขั้น ${index + 1} / ${frames.length}`;
    $<HTMLButtonElement>('#lab-back').disabled = index === 0;
    $<HTMLButtonElement>('#lab-reset').disabled = index === 0;
    $<HTMLButtonElement>('#lab-next').disabled = index >= frames.length - 1;
  }

  function apply(text: string, from?: number) {
    stop();
    const before = frames.length;
    if (!build(text)) return;
    // After a playground action, replay only the steps the new operation added.
    index = from === undefined ? 0 : Math.min(before, frames.length - 1);
    draw();
    if (from !== undefined && index < frames.length - 1) start();
  }

  root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b => b.addEventListener('click', () => selectMode(b.dataset.mode!)));
  $('#lab-apply').addEventListener('click', () => apply(input.value));
  input.addEventListener('keydown', event => { if (event.key === 'Enter') apply(input.value); });
  $('#lab-random').addEventListener('click', () => { const next = mode.input?.random?.(); if (next !== undefined) apply(next); });
  $('#lab-presets').addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-preset]');
    if (button) apply(mode.input!.presets![Number(button.dataset.preset)]);
  });
  $('#lab-action-buttons').addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
    if (!button) return;
    const action = mode.actions![Number(button.dataset.action)];
    const arg = value.value.replace(/[,;|]+/g, ' ').trim().replace(/\s+/g, ' ');
    if (action.value && !arg) { error.textContent = 'ใส่ค่าในช่อง "ค่า" ก่อน'; value.focus(); return; }
    const op = action.value ? `${action.op} ${arg}` : action.op;
    apply(input.value.trim() ? `${input.value.trim()}, ${op}` : op, frames.length);
  });
  value.addEventListener('keydown', event => { if (event.key === 'Enter') root.querySelector<HTMLButtonElement>('[data-action="0"]')?.click(); });
  $('#lab-clear').addEventListener('click', () => apply(''));
  play.addEventListener('click', () => (timer === undefined ? start() : stop()));
  $('#lab-next').addEventListener('click', () => { stop(); if (index < frames.length - 1) { index++; draw(); } });
  $('#lab-back').addEventListener('click', () => { stop(); if (index > 0) { index--; draw(); } });
  $('#lab-reset').addEventListener('click', () => { stop(); index = 0; draw(); });
  speed.addEventListener('input', () => { if (timer !== undefined) start(); });
  selectMode(mode.id);
}

export const randomInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

/** Parses "1, 2, 3" into integers within limits, or returns a Thai error message. */
export function parseNumbers(text: string, min = 2, max = 12, lo = -999, hi = 999): number[] | string {
  const tokens = text.split(/[\s,]+/).filter(Boolean);
  if (tokens.length < min || tokens.length > max) return `ใส่ตัวเลข ${min}–${max} ตัว คั่นด้วย comma`;
  const values = tokens.map(Number);
  if (values.some(v => !Number.isInteger(v) || v < lo || v > hi)) return `ใช้จำนวนเต็มระหว่าง ${lo} ถึง ${hi}`;
  return values;
}

export function parseInteger(text: string, lo: number, hi: number): number | string {
  const n = Number(text.trim());
  return Number.isInteger(n) && n >= lo && n <= hi ? n : `ใส่จำนวนเต็ม ${lo}–${hi}`;
}

/** Renders a tree as nested boxes. `node` returns the label markup and an optional state class. */
export interface TreeNode { label: string; cls?: string; children: (TreeNode | null)[] }
export function treeHtml(node: TreeNode | null): string {
  if (!node) return '<div class="tree-branch"><span class="tree-node is-empty">·</span></div>';
  const kids = node.children.some(Boolean) ? `<div class="tree-children">${node.children.map(treeHtml).join('')}</div>` : '';
  return `<div class="tree-branch"><span class="tree-node ${node.cls ?? ''}">${node.label}</span>${kids}</div>`;
}
