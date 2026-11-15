// Group 09 "Events & System Design": the Events class (on / trigger / off) as a playground.
import { esc, parseOps, type Frame, type LabSpec } from './engine';

function events(text: string): Frame[] | string {
  const ops = parseOps(text);
  if (ops.length > 20) return 'คำสั่งยาวเกินไป (สูงสุด 20 คำสั่ง) กด "ล้าง" แล้วเริ่มใหม่';
  const map = new Map<string, string[]>(), log: string[] = [], frames: Frame[] = [];
  const html = (hot?: string, fired?: string) => `<div class="events-map"><p class="lab-note">this.events</p>${map.size ? [...map].map(([name, cbs]) => `<div class="events-row ${name === hot ? 'is-hot' : ''}"><code>'${esc(name)}'</code><span>→</span><div class="cells">${cbs.map(cb => `<div class="cell ${fired === name ? 'is-done' : ''}"><b>${esc(cb)}</b></div>`).join('')}</div></div>`).join('') : '<em>{ } ยังไม่มี event</em>'}</div><div class="events-log"><p class="lab-note">console</p><ol>${log.map(line => `<li>${esc(line)}</li>`).join('')}</ol></div>`;
  frames.push({ html: html(), message: 'this.events = {} เก็บชื่อ event → รายการ callback', line: -1 });
  for (const [op, name, cb] of ops) {
    if (!name) return `${op} ต้องมีชื่อ event เช่น ${op === 'on' ? 'on click A' : `${op} click`}`;
    if (name.length > 10 || (cb && cb.length > 8)) return 'ชื่อ event ไม่เกิน 10 ตัวอักษร ชื่อ callback ไม่เกิน 8';
    if (op === 'on') {
      if (!cb) return `on ต้องมีชื่อ callback ด้วย เช่น on ${name} A`;
      if ((map.get(name)?.length ?? 0) >= 5) return 'event หนึ่งรับได้ไม่เกิน 5 callback ในตัวอย่างนี้';
      const existed = map.has(name);
      map.set(name, [...(map.get(name) ?? []), cb]);
      frames.push({ html: html(name), message: existed ? `on('${name}', ${cb}) → มี '${name}' อยู่แล้ว push ${cb} ต่อท้าย` : `on('${name}', ${cb}) → ยังไม่มี '${name}' สร้าง array ใหม่ [${cb}]`, line: existed ? 1 : 2 });
    } else if (op === 'trigger') {
      const cbs = map.get(name);
      if (!cbs) { frames.push({ html: html(), message: `trigger('${name}') → ไม่มีใครฟัง '${name}' จึงไม่เกิดอะไร`, line: 5 }); continue; }
      cbs.forEach(c => log.push(`${c}() ← '${name}'`));
      frames.push({ html: html(name, name), message: `trigger('${name}') → เรียก ${cbs.join(', ')} ตามลำดับที่ลงทะเบียน`, line: 5 });
    } else if (op === 'off') {
      const had = map.delete(name);
      frames.push({ html: html(), message: had ? `off('${name}') → delete this.events['${name}'] callback ทั้งหมดของ event นี้หายไป` : `off('${name}') → ไม่มี event นี้อยู่แล้ว`, line: 7 });
    } else return `ไม่รู้จักคำสั่ง "${op}" ใช้ได้: on, trigger, off`;
  }
  return frames;
}

export const eventsLab: LabSpec = {
  id: 'events',
  title: 'Event Emitter Lab',
  description: 'ลงทะเบียน callback ด้วย on แล้วลอง trigger และ off ดูว่า this.events เปลี่ยนอย่างไร',
  legend: [['k-range', 'event ที่เพิ่งเปลี่ยน'], ['k-sorted', 'callback ที่ถูกเรียก']],
  modes: [{
    id: 'events', label: 'Events', complexity: 'trigger O(k) · k = จำนวน callback',
    code: ['on(eventName, callback) {', '  if (this.events[eventName]) this.events[eventName].push(callback);', '  else this.events[eventName] = [callback];', '}', 'trigger(eventName) {', '  if (this.events[eventName]) for (let cb of this.events[eventName]) cb();', '}', 'off(eventName) { delete this.events[eventName]; }'],
    input: { label: 'คำสั่ง', value: 'on click A, on click B, on hover C, trigger click, off click, trigger click', presets: ['on click A, on click B, on hover C, trigger click, off click, trigger click'], hint: 'on ใส่ "ชื่อevent ชื่อcallback" เช่น click A · trigger / off ใส่ชื่อ event' },
    actions: [{ label: 'on', op: 'on', value: true }, { label: 'trigger', op: 'trigger', value: true }, { label: 'off', op: 'off', value: true }],
    build: events,
  }],
};
