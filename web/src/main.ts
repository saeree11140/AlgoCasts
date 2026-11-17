// Self-hosted IBM Plex Sans Thai so the app renders the same offline.
import '@fontsource/ibm-plex-sans-thai/400.css';
import '@fontsource/ibm-plex-sans-thai/500.css';
import '@fontsource/ibm-plex-sans-thai/600.css';
import '@fontsource/ibm-plex-sans-thai/700.css';
import './style.css';
import './ui-refinements.css';
import './workspace-layout.css';
import DOMPurify from 'dompurify';
import {marked} from 'marked';
import {load,save,validateBackup} from './storage';
import {cancelRun,runCode} from './runner';
import {openDiagram} from './diagram-viewer';
import {guideGroups,guideNotes} from './guide-content';
import type {Detail,Manifest,Problem,RunResult} from './types';
import type {EditorView} from 'codemirror';

const app=document.querySelector<HTMLDivElement>('#app')!;
const state=load();
let manifest:Manifest;
let editor:EditorView|undefined;
let routeVersion=0;
let runVersion=0;
const cache=new Map<string,Detail>();
const e=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const markdown=(source:string)=>DOMPurify.sanitize(marked.parse(source,{async:false}) as string);
const icon=(name:string)=>{const paths:Record<string,string>={home:'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',code:'m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16',book:'M12 5c-3-2-7-2-10-1v16c3-1 7-1 10 1m0-16c3-2 7-2 10-1v16c-3-1-7-1-10 1V5',check:'m5 12 4 4L19 6',grid:'M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z',arrow:'M5 12h14m-6-6 6 6-6 6',star:'m12 3 3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1Z',sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',play:'m8 4 12 8-12 8Z',clock:'M12 8v5l3 2m7-3a10 10 0 1 1-20 0 10 10 0 0 1 20 0',search:'m16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',download:'M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4'};return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]||paths.code}"/></svg>`;};
function persist(){if(!save(state))toast('พื้นที่เก็บข้อมูลไม่พร้อมใช้งาน กรุณาส่งออกข้อมูลเพื่อสำรอง');}
function toast(message:string){document.querySelector('#toast')?.remove();const t=document.createElement('div');t.id='toast';t.role='status';t.textContent=message;document.body.append(t);setTimeout(()=>t.remove(),4000);}
const status=(p:Problem)=>state.problems[p.id]?.solved?'ผ่านแล้ว':state.problems[p.id]?.code?'กำลังฝึก':'ยังไม่เริ่ม';
const difficulty=(p:Problem)=>`<span class="badge ${p.difficulty==='Easy'?'green':'amber'}">${e(p.difficulty)}</span>`;
const countSolved=()=>manifest.problems.filter(p=>state.problems[p.id]?.solved).length;
const pct=()=>Math.round(countSolved()/manifest.problems.length*100);
const go=(path:string)=>{location.hash=path;};
function shell(active:string,body:string,wide=false,layout:'page'|'workspace'='page'){
 app.dataset.layout=layout;
 const nav=[['home','หน้าหลัก','home','/'],['problems','แบบฝึกหัด','code','/problems'],['solutions','เฉลย','check','/solutions'],['guides','คู่มือ','book','/guides'],['competency','เตรียมสอบ Developer','grid','/competency']];
 app.innerHTML=`<a class="skip-link" href="#main">ข้ามไปเนื้อหา</a><header class="topbar"><div class="topbar-inner"><a class="brand" href="#/"><span class="brand-mark">${icon('code')}</span><span>Algo<span class="blue-text">Casts</span><small>ฝึก TypeScript</small></span></a><div class="top-actions"><span class="local-label"><i></i> พื้นที่ฝึกของฉัน</span><button class="icon-button" id="theme" aria-label="สลับธีมสว่างและมืด">${icon('sun')}</button><details class="data-menu"><summary>ข้อมูลของฉัน</summary><div class="data-options"><p>บันทึกในเบราว์เซอร์เครื่องนี้</p><button id="export">ส่งออกความคืบหน้า</button><label class="import-button">นำเข้าข้อมูลสำรอง<input type="file" id="import" accept="application/json,.json" hidden></label></div></details></div></div></header><nav class="main-nav" aria-label="เมนูหลัก"><div>${nav.map(([id,label,ico,url])=>`<a href="#${url}" ${active===id?'aria-current="page"':''}>${icon(ico)}${label}</a>`).join('')}<span class="nav-progress">${countSolved()}/${manifest.problems.length} ผ่านแล้ว</span></div></nav><main id="main" class="${wide?'wide':''} ${layout==='workspace'?'workspace-page':''}" tabindex="-1">${body}</main><footer><span>AlgoCasts <b>Practice Studio</b></span><span>คำตอบและความคืบหน้าบันทึกในเบราว์เซอร์นี้</span></footer>`;
 document.documentElement.dataset.theme=state.theme||'light';
 document.querySelector('.skip-link')!.addEventListener('click',event=>{event.preventDefault();document.querySelector<HTMLElement>('#main')?.focus();document.querySelector('#main')?.scrollIntoView({block:'start'});});
 const themeButton=document.querySelector<HTMLButtonElement>('#theme')!;
 themeButton.setAttribute('aria-pressed',String(state.theme==='dark'));
 themeButton.addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=state.theme;themeButton.setAttribute('aria-pressed',String(state.theme==='dark'));persist();});
 document.querySelector('#export')!.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='algocasts-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 document.querySelector('#import')!.addEventListener('change',async event=>{
  const file=(event.target as HTMLInputElement).files?.[0];if(!file)return;
  if(file.size>5_000_000)return toast('ไฟล์ต้องมีขนาดไม่เกิน 5 MB');
  try{const incoming=validateBackup(JSON.parse(await file.text()));if(!confirm('นำเข้าข้อมูลแทนที่ความคืบหน้าปัจจุบัน? ส่งออกสำรองก่อนหากต้องการเก็บข้อมูลเดิม'))return;Object.assign(state,incoming);persist();render();toast('นำเข้าข้อมูลแล้ว');}catch(error){toast(String(error));}
 });
}
const heading=(title:string,description:string)=>`<div class="page-heading"><h1>${title}</h1><p>${description}</p></div>`;
function home(){
 const current=manifest.problems.find(p=>p.id===state.lastProblem)||manifest.problems[0];
 const recent=manifest.problems.filter(p=>state.problems[p.id]?.code).sort((a,b)=>(state.problems[b.id]?.updatedAt||'').localeCompare(state.problems[a.id]?.updatedAt||'')).slice(0,4);
 const categories=[...new Set(manifest.problems.map(p=>p.category))];
 shell('home',`<section class="welcome"><div><h1>วันนี้ <span class="blue-text">ฝึกอะไรดี?</span></h1><p class="lead">ฝึก TypeScript กับโจทย์ Algorithms และ API<br>เขียนคำตอบ รันทดสอบ และอ่านเฉลยได้ในที่เดียว</p><div class="button-row"><a class="button primary" href="#/problem/${current.id}">${icon('play')}${state.lastProblem?'ฝึกต่อจากครั้งล่าสุด':'เริ่มฝึกเขียนโค้ด'}</a><a class="button" href="#/competency">เตรียมสอบ Developer ${icon('arrow')}</a></div><div class="welcome-tags"><span>TypeScript</span><span>Algorithms</span><span>API Challenges</span></div></div><aside class="progress-card"><div class="section-kicker">ความคืบหน้าของฉัน <span>บนเครื่องนี้</span></div><div class="progress-body"><div class="progress-ring" style="--progress:${pct()}%"><div><strong>${pct()}<small>%</small></strong><span>ทำสำเร็จแล้ว</span></div></div><div><strong class="stat-number">${countSolved()} <small>/ ${manifest.problems.length}</small></strong><p>โจทย์ที่ผ่านชุดทดสอบ</p><span class="badge blue">${manifest.problems.filter(p=>state.problems[p.id]?.code&&!state.problems[p.id]?.solved).length} ข้อกำลังฝึก</span></div></div><div class="continue-line"><span>โจทย์${state.lastProblem?'ล่าสุด':'แนะนำ'}</span><a href="#/problem/${current.id}">${e(current.title)} ${icon('arrow')}</a></div></aside></section>
 <div class="overview-strip"><a href="#/problems"><span class="overview-icon blue">${icon('code')}</span><strong>${manifest.problems.length}</strong><span>โจทย์พร้อมฝึก</span>${icon('arrow')}</a><a href="#/competency"><span class="overview-icon purple">${icon('grid')}</span><strong>${manifest.competencies.length}</strong><span>ทักษะเตรียมสอบ</span>${icon('arrow')}</a><a href="#/guides"><span class="overview-icon teal">${icon('book')}</span><strong>${manifest.diagrams.length}</strong><span>ภาพอธิบายแนวคิด</span>${icon('arrow')}</a></div>
 <section class="section-block"><div class="section-title"><div><h2>เลือกเรื่องที่อยากฝึก</h2></div><a class="text-link" href="#/problems">ดูโจทย์ทั้งหมด ${icon('arrow')}</a></div><div class="topic-grid">${categories.map((category,i)=>{const items=manifest.problems.filter(p=>p.category===category);return `<a class="topic-card tone-${i%5}" href="#/problems?category=${encodeURIComponent(category)}"><div class="topic-top"><span class="topic-number">${String(i+1).padStart(2,'0')}</span>${icon('arrow')}</div><h3>${e(category)}</h3><p>${items.length} โจทย์ <span>· ${items.filter(p=>state.problems[p.id]?.solved).length} ผ่านแล้ว</span></p></a>`;}).join('')}</div></section>
 <section class="bottom-grid"><div class="panel"><div class="section-title"><h2>${recent.length?'กลับมาฝึกต่อ':'เริ่มจากพื้นฐาน'}</h2><span class="muted">เลือกโจทย์เพื่อเริ่มฝึก</span></div>${(recent.length?recent:manifest.problems.slice(0,3)).map(p=>`<a class="recent-row" href="#/problem/${p.id}"><span class="row-icon">${icon(state.problems[p.id]?.solved?'check':'code')}</span><span><strong>${e(p.title)}</strong><small>${e(p.category)}</small></span>${difficulty(p)}${icon('arrow')}</a>`).join('')}</div><div class="study-callout"><h2>ทบทวนทักษะ<br>Developer</h2><p>ทบทวน SQL, Git, Testing และ System Design<br>พร้อมบทเรียนและแนวข้อสอบแต่ละระดับ</p><a class="text-link" href="#/competency">เลือกทักษะที่อยากพัฒนา ${icon('arrow')}</a></div></section>`);
}
function problemList(params:URLSearchParams,solutions=false){
 shell(solutions?'solutions':'problems',`${heading(solutions?'เฉลยและวิธีคิด':'แบบฝึกหัด','เลือกโจทย์ตามทักษะ ฝึกคิดด้วยตัวเอง แล้วตรวจคำตอบด้วยชุดทดสอบ')}<div class="library-layout"><aside class="library-sidebar"><h2>หมวดหมู่</h2><div id="categories"></div><div class="sidebar-note">${icon('book')}<strong>ฝึกให้เข้าใจ</strong><p>เริ่มจากโจทย์ระดับ Easy แล้วค่อยขยับไปโครงสร้างข้อมูลและ API</p></div></aside><section class="library-main"><div class="filter-bar"><label class="search-field">${icon('search')}<input id="search" type="search" placeholder="ค้นหาชื่อโจทย์หรือคำอธิบาย" aria-label="ค้นหาโจทย์"></label><select id="source" aria-label="ชุดโจทย์"><option value="">ทุกชุดโจทย์</option><option>AlgoCasts</option><option>LeetCode</option><option>HackerRank</option><option>API Lab</option><option>Coding Practice</option></select><select id="difficulty" aria-label="ระดับความยาก"><option value="">ทุกระดับ</option><option>Easy</option><option>Medium</option></select><select id="status" aria-label="สถานะโจทย์"><option value="">ทุกสถานะ</option><option value="ผ่านแล้ว">ผ่านแล้ว</option><option value="กำลังฝึก">กำลังฝึก</option><option value="ยังไม่เริ่ม">ยังไม่เริ่ม</option><option value="bookmark">บันทึกไว้</option></select></div><div class="list-caption"><span id="result-count"></span><span>TypeScript · Browser Sandbox</span></div><div class="problem-table"><div class="table-head"><span>โจทย์</span><span>ระดับ</span><span>สถานะ</span><span></span></div><div id="problem-rows"></div></div></section></div>`);
 let category=params.get('category')||'';
 document.querySelector<HTMLSelectElement>('#source')!.value=params.get('source')==='practice'?'Coding Practice':'';
 const categories=['',...new Set(manifest.problems.map(p=>p.category))];
 const renderRows=()=>{
  const query=(document.querySelector<HTMLInputElement>('#search')!.value||'').toLowerCase();
  const diff=document.querySelector<HTMLSelectElement>('#difficulty')!.value;
  const selected=document.querySelector<HTMLSelectElement>('#status')!.value;
  const source=document.querySelector<HTMLSelectElement>('#source')!.value;
  const filtered=manifest.problems.filter(p=>(!source||p.source===source)&&(!category||p.category===category)&&(!query||`${p.title} ${p.description} ${p.category}`.toLowerCase().includes(query))&&(!diff||p.difficulty===diff)&&(!selected||(selected==='bookmark'?state.problems[p.id]?.bookmarked:status(p)===selected)));
  document.querySelector('#categories')!.innerHTML=categories.map(c=>`<button data-category="${e(c)}" class="category-button ${c===category?'selected':''}"><span>${e(c||'โจทย์ทั้งหมด')}</span><span>${manifest.problems.filter(p=>!c||p.category===c).length}</span></button>`).join('');
  document.querySelector('#result-count')!.textContent=`${filtered.length} โจทย์${category?' · '+category:''}`;
  document.querySelector('#problem-rows')!.innerHTML=filtered.map(p=>`<div class="problem-row"><a class="problem-name" href="#/problem/${p.id}${solutions?'?tab=solution':''}"><span class="problem-status-icon ${state.problems[p.id]?.solved?'done':''}">${icon(state.problems[p.id]?.solved?'check':'code')}</span><span><strong>${e(p.title)}</strong><small>${e(p.category)} <span>· ${e(p.source)}</span></small></span></a>${difficulty(p)}<span class="status-text ${state.problems[p.id]?.solved?'green-text':''}">${status(p)}</span><button class="icon-button bookmark ${state.problems[p.id]?.bookmarked?'saved':''}" data-bookmark="${p.id}" aria-label="บันทึก ${e(p.title)}" aria-pressed="${!!state.problems[p.id]?.bookmarked}">${icon('star')}</button></div>`).join('')||'<div class="empty-state"><h3>ยังไม่พบโจทย์ที่ตรงกัน</h3><p>ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p><button class="button" id="clear-filters">ล้างตัวกรอง</button></div>';
  document.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(b=>b.onclick=()=>{category=b.dataset.category!;renderRows();});
  document.querySelectorAll<HTMLButtonElement>('[data-bookmark]').forEach(b=>b.onclick=()=>{const id=b.dataset.bookmark!;state.problems[id]??={};state.problems[id].bookmarked=!state.problems[id].bookmarked;persist();renderRows();});
  document.querySelector('#clear-filters')?.addEventListener('click',()=>{category='';document.querySelector<HTMLInputElement>('#search')!.value='';document.querySelector<HTMLSelectElement>('#difficulty')!.value='';document.querySelector<HTMLSelectElement>('#source')!.value='';document.querySelector<HTMLSelectElement>('#status')!.value='';renderRows();});
 };
 for(const id of ['search','source','difficulty','status'])document.querySelector('#'+id)!.addEventListener(id==='search'?'input':'change',renderRows);
 renderRows();
}
async function detailFor(id:string){if(cache.has(id))return cache.get(id)!;const response=await fetch(`/content/problems/${encodeURIComponent(id)}.json`);if(!response.ok)throw new Error('ไม่พบโจทย์นี้');const detail=await response.json() as Detail;cache.set(id,detail);return detail;}
async function workspace(id:string,params:URLSearchParams,version:number){
 shell('problems','<p class="loading">กำลังเปิดโจทย์…</p>',true);
 const detail=await detailFor(id);if(version!==routeVersion)return;
 state.lastProblem=id;persist();
 shell('problems',`<div class="workspace-breadcrumb"><a href="#/problems">แบบฝึกหัด</a><span>/</span><span>${e(detail.category)}</span><span>/</span><strong>${e(detail.title)}</strong></div><div class="workspace-heading"><div><h1>${e(detail.title)}</h1><div class="inline-meta">${difficulty(detail)}<span>${e(detail.category)}</span><span>· ${e(detail.source)}</span></div></div><a class="text-link" href="#/guides?group=${detail.guideGroup}">${icon('book')}คู่มือที่เกี่ยวข้อง</a></div><section class="workspace"><div class="statement-pane"><div class="tabs" role="tablist" aria-label="เนื้อหาโจทย์">${[['problem','โจทย์'],['hint','คำใบ้'],['solution','เฉลย'],['tests','ชุดทดสอบ'],['history','ประวัติ']].map(([key,label])=>`<button role="tab" id="tab-${key}" aria-controls="statement" data-tab="${key}">${label}</button>`).join('')}</div><div class="statement prose" id="statement" role="tabpanel"></div></div><div class="coding-pane"><div class="editor-toolbar"><span><i></i> TypeScript <small>index.ts</small></span><div><span id="save-state" class="save-state">บันทึกอัตโนมัติ</span><button id="reset" class="icon-button" aria-label="เริ่มโค้ดใหม่">↺</button></div></div><div id="editor" class="code-editor"></div><div class="run-toolbar"><span id="runner-note">${icon('clock')}จำกัดเวลา 8 วินาที</span><div><button id="run" class="button">${icon('play')}รันทดสอบ</button><button id="submit" class="button primary">${icon('check')}ส่งคำตอบ</button><button id="stop" class="button danger" hidden>หยุด</button></div></div><section class="results" aria-label="ผลทดสอบ"><div class="results-heading"><h2>ผลทดสอบ</h2><span id="result-summary" class="muted">ยังไม่ได้รัน</span></div><div id="results" role="status"><div class="result-placeholder">${icon('code')}<p>เขียนคำตอบ แล้วกด <strong>รันทดสอบ</strong><br><small>รันทดสอบ = 3 เคสแรก · ส่งคำตอบ = ทุกเคส</small></p></div></div></section></div></section><p class="workspace-note">คำตอบและประวัติบันทึกเฉพาะเครื่องนี้ · ทดสอบการทำงานของโค้ด ไม่ตรวจ TypeScript types แบบเต็ม${id==='chocolate-report'?' · ใช้ Mock API ภายในสำหรับ pagination และ retry':''}</p>`,true,'workspace');
 let tab=params.get('tab')||'problem';
 const renderTab=()=>{
  document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.tab===tab));b.tabIndex=b.dataset.tab===tab?0:-1;});
  const pane=document.querySelector<HTMLElement>('#statement')!;pane.setAttribute('aria-labelledby','tab-'+tab);
  if(tab==='problem')pane.innerHTML=`<h2>โจทย์</h2><p>${e(detail.description)}</p>${detail.markdown?markdown(detail.directions):`<pre class="directions">${e(detail.directions)}</pre>`}<div class="note blue"><strong>สิ่งที่ต้องทำ</strong><p>แก้เฉพาะ index.ts โดยคงชื่อฟังก์ชันและ export ให้ตรงกับชุดทดสอบ ส่วน helper ที่ import มาพร้อมใช้งานแล้ว</p></div>`;
  else if(tab==='hint')pane.innerHTML=`<h2>ลองคิดจากตรงนี้</h2><div class="note amber"><p>${e(detail.hint)}</p></div><h3>ก่อนลงมือเขียน</h3><ol><li>ลองไล่ตัวอย่างด้วยมือ</li><li>คิดกรณีข้อมูลว่างหรือขอบเขต</li><li>อธิบายขั้นตอน แล้วค่อยแปลงเป็นโค้ด</li></ol>`;
  else if(tab==='solution')pane.innerHTML=`<h2>เฉลยและวิธีคิด</h2><p>${e(detail.hint)}</p><div class="note green"><strong>Complexity</strong><p>${e(detail.complexity)}</p></div><pre><code>${e(detail.solution)}</code></pre><p class="muted">${detail.sourcePath.startsWith('exercises/')?'เฉลยจาก completed_exercises':'ตัวอย่างเฉลยสำหรับฝึกในเว็บ'}${detail.source==='LeetCode'||detail.source==='HackerRank'?` · โจทย์อิงรูปแบบจาก ${e(detail.source)}`:''} · อ่านแล้วลองเขียนใหม่ด้วยตัวเอง</p><button class="button" id="download-solution">${icon('download')}ดาวน์โหลดเฉลย .ts</button>`;
  else if(tab==='tests')pane.innerHTML=`<h2>ชุดทดสอบที่ใช้ตรวจคำตอบ</h2><p>ทุกเคสเปิดให้อ่าน เพื่อเข้าใจพฤติกรรมที่โจทย์ต้องการ</p><pre><code>${e(detail.modules['./test'])}</code></pre>${Object.keys(detail.modules).length>1?`<h3>Helper ที่พร้อมใช้งาน</h3>${Object.entries(detail.modules).filter(([k])=>k!=='./test').map(([name,code])=>`<details><summary>${e(name)}.ts</summary><pre><code>${e(code)}</code></pre></details>`).join('')}`:''}`;
  else pane.innerHTML=`<h2>ประวัติส่งคำตอบ</h2>${state.problems[id]?.attempts?.length?state.problems[id].attempts!.slice().reverse().map(a=>`<div class="attempt-row"><span>${new Date(a.at).toLocaleString('th-TH')}</span><span class="badge ${a.success?'green':'red'}">${a.success?'ผ่าน':'ยังไม่ผ่าน'} ${a.passed}/${a.total}</span></div>`).join(''):'<p class="muted">ยังไม่มีการส่งคำตอบ กด “ส่งคำตอบ” เพื่อบันทึกผล</p>'}`;
  pane.querySelector('#download-solution')?.addEventListener('click',()=>{const u=URL.createObjectURL(new Blob([detail.solution],{type:'text/plain'}));const a=document.createElement('a');a.href=u;a.download=id+'-solution.ts';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});
 };
 document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(b=>{b.onclick=()=>{tab=b.dataset.tab!;renderTab();};b.onkeydown=ev=>{if(ev.key!=='ArrowLeft'&&ev.key!=='ArrowRight')return;ev.preventDefault();const tabs=[...document.querySelectorAll<HTMLButtonElement>('[data-tab]')];const next=tabs[(tabs.indexOf(b)+(ev.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];next.click();next.focus();};});
 renderTab();
 const {mountEditor}=await import('./editor');if(version!==routeVersion)return;
 editor=mountEditor(document.querySelector('#editor')!,state.problems[id]?.code??detail.starter,code=>{
  state.problems[id]??={};state.problems[id].code=code;state.problems[id].updatedAt=new Date().toISOString();
  const okay=save(state);document.querySelector('#save-state')!.textContent=okay?'บันทึกแล้ว':'บันทึกไม่ได้ — ส่งออกสำรอง';
 });
 document.querySelector('#reset')!.addEventListener('click',()=>{if(!confirm('เริ่มโค้ดข้อนี้ใหม่? คำตอบที่กำลังเขียนจะถูกแทนด้วยโค้ดตั้งต้น'))return;editor!.dispatch({changes:{from:0,to:editor!.state.doc.length,insert:detail.starter}});});
 const execute=async(sample:boolean)=>{
  const run=++runVersion;const submittedCode=editor!.state.doc.toString();
  document.querySelectorAll<HTMLButtonElement>('#run,#submit').forEach(b=>b.disabled=true);document.querySelector<HTMLButtonElement>('#stop')!.hidden=false;
  document.querySelector('#result-summary')!.textContent='กำลังทดสอบ…';document.querySelector('#results')!.innerHTML='<p class="loading">กำลังเตรียม TypeScript และรันชุดทดสอบ…</p>';
  let result:RunResult;
  try{result=await runCode(detail,submittedCode,sample);}catch(error){result={tests:[],logs:[],error:String(error)};}
  if(version!==routeVersion||run!==runVersion)return;
  document.querySelectorAll<HTMLButtonElement>('#run,#submit').forEach(b=>b.disabled=false);document.querySelector<HTMLButtonElement>('#stop')!.hidden=true;
  const passed=result.tests.filter(t=>t.status==='pass').length,total=result.tests.filter(t=>t.status!=='skip').length;
  const success=!result.error&&total>0&&passed===total;
  document.querySelector('#result-summary')!.innerHTML=`<span class="${success?'green-text':'red-text'}">${result.error?'ทำงานไม่สำเร็จ':`${passed}/${total} ผ่าน${sample?' · ทดสอบบางส่วน':''}`}</span>`;
  document.querySelector('#results')!.innerHTML=`${result.error?`<pre class="error-output">${e(result.error)}</pre>`:''}${result.tests.map(t=>`<details class="test-case ${t.status}" ${t.status==='fail'||t.logs?.length?'open':''}><summary><span>${t.status==='pass'?'✓':t.status==='skip'?'–':'×'}</span><strong>${e(t.name)}</strong><small>${t.status==='skip'?'ข้าม':`${t.duration} ms`}</small></summary>${t.logs?.length?`<div class="test-log"><span>Console (${t.logs.length})</span><pre>${e(t.logs.join('\n'))}</pre></div>`:''}${t.error?`<pre>${e(t.error)}</pre>`:''}</details>`).join('')}${result.logs.length?`<details class="console-output"><summary>Console นอกเคสทดสอบ (${result.logs.length})</summary><pre>${e(result.logs.join('\n'))}</pre></details>`:''}${success&&!sample?'<div class="success-banner">ผ่านชุดทดสอบทั้งหมดแล้ว! เลือกโจทย์ถัดไปได้จากเมนูแบบฝึกหัด</div>':''}`;
  if(!sample){state.problems[id]??={};const p=state.problems[id];p.attempts=[...(p.attempts||[]),{at:new Date().toISOString(),passed,total:Math.max(total,1),success}].slice(-10);if(success)p.solved=true;persist();if(tab==='history')renderTab();const progress=document.querySelector('.nav-progress');if(progress)progress.textContent=`${countSolved()}/${manifest.problems.length} ผ่านแล้ว`;}
 };
 document.querySelector('#run')!.addEventListener('click',()=>execute(true));
 document.querySelector('#submit')!.addEventListener('click',()=>execute(false));
 document.querySelector('#stop')!.addEventListener('click',cancelRun);
}
function competencies(){
 shell('competency',`${heading('เตรียมสอบ Developer','ทบทวนพื้นฐาน ฝึกลงมือทำ แล้วประเมินความเข้าใจด้วยแนวข้อสอบ')}<div class="competency-intro"><div><h2>บทเรียนและแนวข้อสอบ Developer</h2><p>แต่ละหัวข้อมีบทเรียน ตัวอย่าง และแนวข้อสอบระดับ Beginner ถึง Advance ในหน้าเดียว<br>เลือกเรื่องที่ต้องการทบทวน แล้วเรียนตามจังหวะของตัวเอง</p></div><div class="read-summary"><strong>${state.read.length}<small> / ${manifest.competencies.length}</small></strong><span>หัวข้อที่ทำเครื่องหมายว่าอ่านแล้ว</span></div></div><div class="competency-grid">${manifest.competencies.map((c,i)=>`<a class="competency-card tone-${i%5}" href="#/competency/${c.id}"><div class="competency-card-top"><span class="competency-abbr">${c.abbr}</span>${state.read.includes(c.id)?'<span class="badge green">อ่านแล้ว</span>':'<span class="muted">บทเรียน + แนวข้อสอบ</span>'}</div><h2>${e(c.title)}</h2><p>${e(c.description)}</p><div class="competency-card-bottom"><span>${c.sections.length} ส่วนเนื้อหา</span><span class="text-link">เริ่มทบทวน ${icon('arrow')}</span></div></a>`).join('')}</div><div class="panel resources"><div><h2>ฝึก Coding Test เพิ่มเติม</h2><p>Linked List, Two Sum, Group Anagrams, Binary Search และ Top K Frequent</p></div><a class="button" href="#/problems?source=practice">ชุดฝึก Coding Practice ${icon('arrow')}</a><a class="button" href="/content/documents/exploring-js.pdf" target="_blank" rel="noopener">เอกสาร JavaScript PDF ${icon('arrow')}</a></div>`);
}
function competencyReader(id:string){
 const c=manifest.competencies.find(c=>c.id===id);if(!c)return notFound();
 shell('competency',`<div class="reader-toolbar"><a class="text-link" href="#/competency">← ทุกทักษะ</a><h1>${e(c.title)}</h1><button id="mark-read" class="button ${state.read.includes(id)?'':'primary'}">${state.read.includes(id)?'อ่านแล้ว ✓':'ทำเครื่องหมายว่าอ่านแล้ว'}</button><a class="button" href="/content/${c.path}" target="_blank" rel="noopener">เปิดเต็มหน้า ↗</a></div><iframe class="document-frame" title="${e(c.title)} — บทเรียนและแบบทดสอบ" src="/content/${c.path}" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-downloads"></iframe>`,true);
 const markRead=document.querySelector<HTMLButtonElement>('#mark-read')!;
 markRead.setAttribute('aria-pressed',String(state.read.includes(id)));
 markRead.addEventListener('click',()=>{state.read=state.read.includes(id)?state.read.filter(x=>x!==id):[...state.read,id];persist();const read=state.read.includes(id);markRead.textContent=read?'อ่านแล้ว ✓':'ทำเครื่องหมายว่าอ่านแล้ว';markRead.classList.toggle('primary',!read);markRead.setAttribute('aria-pressed',String(read));});
}
function guides(params:URLSearchParams){
 const selected=params.get('group')||'';
 const groups=Object.entries(manifest.diagramGroups).sort(([a],[b])=>a.localeCompare(b));
 const visible=(group:string)=>manifest.diagrams.filter(d=>d.group===group&&!guideNotes[d.id]?.hidden);
 const tabs=`<div class="guide-tabs"><a class="button ${!selected?'primary':''}" href="#/guides">ทั้งหมด</a>${groups.map(([key,title])=>`<a class="button ${selected===key?'primary':''}" href="#/guides?group=${key}">${e(title)}</a>`).join('')}</div>`;
 const top=heading('คู่มือและภาพอธิบาย','เข้าใจวิธีคิดก่อนเขียนโค้ด เชื่อมภาพประกอบกับโจทย์ที่กำลังฝึก')+tabs;
 if(!selected||!manifest.diagramGroups[selected]){
  shell('guides',`${top}<section class="guide-intro panel prose"><h2>ฝึกอย่างไรให้เข้าใจ</h2><div class="learning-steps"><div><span>01</span><h3>อ่านโจทย์</h3><p>ระบุ Input, Output และกรณีขอบให้ชัด</p></div><div><span>02</span><h3>วาดวิธีคิด</h3><p>ไล่ข้อมูลทีละขั้น แล้วเลือกโครงสร้างที่เหมาะ</p></div><div><span>03</span><h3>เขียนและทดสอบ</h3><p>เริ่มจากคำตอบที่ถูก แล้วค่อยลดเวลาและพื้นที่</p></div></div><p><strong>Big O:</strong> O(1) คงที่ · O(log n) ลดช่วงครึ่งหนึ่ง · O(n) อ่านทุกสมาชิก · O(n log n) เช่น Merge Sort · O(n²) เช่น loop ซ้อนที่ขึ้นกับ n ทั้งคู่</p><div class="button-row"><a class="button" href="#/reading/coding-practice">คู่มือ Coding Practice 6 ข้อ</a><a class="button" href="#/reading/chocolate-score">โจทย์ Chocolate API: Score</a></div></section><div class="section-title"><h2>เลือกหมวดที่อยากเรียน</h2><span class="muted">${groups.length} หมวด · ${manifest.diagrams.filter(d=>!guideNotes[d.id]?.hidden).length} ภาพ</span></div><div class="guide-group-grid">${groups.map(([key,title])=>{const g=guideGroups[key];const first=visible(key)[0];return `<a class="guide-group-card" href="#/guides?group=${key}"><span class="guide-group-thumb">${first?`<img src="/content/${first.path}" alt="" loading="lazy">`:''}</span><span class="guide-group-body"><span class="eyebrow">หมวด ${key}</span><strong>${e(title)}</strong><span>${e(g?.summary??'')}</span><small>${visible(key).length} ภาพ · มี Lab ให้ลองเอง ${icon('arrow')}</small></span></a>`;}).join('')}</div>`);
  return;
 }
 const group=guideGroups[selected],diagrams=visible(selected);
 const problems=(group?.problems??[]).map(id=>manifest.problems.find(p=>p.id===id)).filter((p):p is Problem=>!!p);
 const step=(d:typeof diagrams[number],i:number)=>{
  const note=guideNotes[d.id];
  return `<li class="lesson-step" id="diagram-${d.id}"><button class="diagram-preview lesson-preview" data-diagram="${d.id}" aria-label="ขยายภาพ ${e(note?.title??d.title)}"><img src="/content/${d.path}" alt="${e(note?.title??d.title)}" loading="lazy"></button><div class="lesson-text"><span class="lesson-no">${String(i+1).padStart(2,'0')}</span><h3>${e(note?.title??d.title)}</h3><p class="lesson-source">ภาพต้นฉบับ: ${e(d.title)}</p>${note?`<p>${e(note.summary)}</p>${note.points?.length?`<ul>${note.points.map(point=>`<li>${e(point)}</li>`).join('')}</ul>`:''}`:''}<div class="lesson-actions"><button class="button" data-diagram="${d.id}">${icon('search')}ขยายภาพ</button>${note?.lab?`<a class="button" href="#/guides?group=${selected}&lab=${note.lab}">ลองใน Lab ${icon('arrow')}</a>`:''}</div></div></li>`;
 };
 shell('guides',`${top}<section class="lesson-intro panel"><div><p class="eyebrow">หมวด ${selected}</p><h2>${e(manifest.diagramGroups[selected])}</h2><p>${e(group?.summary??'')}</p></div>${group?`<div class="lesson-goals"><h3>เรียนจบหมวดนี้แล้วควร</h3><ul>${group.goals.map(goal=>`<li>${e(goal)}</li>`).join('')}</ul>${problems.length?`<h3>โจทย์ที่เกี่ยวข้อง</h3><div class="chip-row">${problems.map(p=>`<a class="chip" href="#/problem/${p.id}">${e(p.title)}</a>`).join('')}</div>`:''}</div>`:''}</section><div id="guide-lab-slot"><p class="loading">กำลังโหลด Lab…</p></div><div class="section-title"><h2>บทเรียนทีละภาพ</h2><span class="muted">${diagrams.length} ภาพ · กดภาพเพื่อขยาย</span></div><ol class="lesson-list">${diagrams.map(step).join('')}</ol>`);
 document.querySelectorAll<HTMLButtonElement>('[data-diagram]').forEach(button=>button.onclick=()=>{const d=manifest.diagrams.find(d=>d.id===button.dataset.diagram)!;openDiagram(guideNotes[d.id]?.title??d.title,'/content/'+d.path,d.category);});
 // Wide diagrams (e.g. long linked lists) read better across the full card width.
 document.querySelectorAll<HTMLImageElement>('.lesson-preview img').forEach(img=>{const mark=()=>{if(img.naturalWidth>760&&img.naturalWidth/img.naturalHeight>2.2)img.closest('.lesson-step')?.classList.add('is-wide');};if(img.complete)mark();else img.addEventListener('load',mark,{once:true});});
 const version=routeVersion,slot=document.querySelector<HTMLElement>('#guide-lab-slot')!;
 import('./labs').then(({labs,labHtml,mountLab})=>{
  if(version!==routeVersion||!slot.isConnected)return;
  const spec=labs[selected];if(!spec){slot.remove();return;}
  slot.innerHTML=labHtml(spec);
  const lab=slot.querySelector<HTMLElement>('#guide-lab')!;
  mountLab(lab,spec,params.get('lab')??undefined);
  if(params.get('lab'))lab.scrollIntoView({block:'start'});
 }).catch(()=>{slot.innerHTML='<p class="loading">โหลด Lab ไม่สำเร็จ ลองรีเฟรชหน้านี้</p>';});
}
async function reading(id:string,version:number){
 const files:Record<string,[string,string]>={'coding-practice':['Coding Practice — คู่มือ 6 โจทย์','coding-practice.md'],'chocolate-score':['Chocolate API — Pagination & Score','chocolate-score.md']};
 if(!files[id])return notFound();
 const [title,file]=files[id];shell('guides','<p class="loading">กำลังเปิดคู่มือ…</p>');
 const response=await fetch('/content/documents/'+file);if(!response.ok)throw new Error('เปิดคู่มือไม่สำเร็จ');const text=await response.text();if(version!==routeVersion)return;
 shell('guides',`<a class="text-link" href="#/guides">← คู่มือทั้งหมด</a><article class="reading-article panel prose"><h1>${title}</h1>${markdown(text)}</article>`);
}
function notFound(){shell('',`<div class="empty-state"><h1>ไม่พบหน้านี้</h1><p>ลิงก์อาจไม่ถูกต้อง หรือเนื้อหาถูกย้าย</p><a class="button primary" href="#/">กลับหน้าหลัก</a></div>`);}
async function render(){
 const version=++routeVersion;++runVersion;cancelRun();editor?.destroy();editor=undefined;
 document.querySelector<HTMLDialogElement>('#diagram-dialog')?.close();
 const [path,query]=(location.hash.slice(1)||'/').split('?');const params=new URLSearchParams(query);const parts=path.split('/').filter(Boolean);
 window.scrollTo(0,0);
 try{
  if(!parts.length)home();
  else if(parts[0]==='problems')problemList(params);
  else if(parts[0]==='solutions')problemList(params,true);
  else if(parts[0]==='problem'&&parts[1])await workspace(parts[1],params,version);
  else if(parts[0]==='competency')parts[1]?competencyReader(parts[1]):competencies();
  else if(parts[0]==='guides')guides(params);
  else if(parts[0]==='reading')await reading(parts[1],version);
  else notFound();
 }catch(error){if(version===routeVersion)shell('',`<div class="empty-state"><h1>เปิดหน้านี้ไม่สำเร็จ</h1><p>${e(error)}</p><button class="button" id="retry-page">ลองใหม่</button></div>`);document.querySelector('#retry-page')?.addEventListener('click',render);}
}
async function init(){
 try{const response=await fetch('/content/manifest.json');if(!response.ok)throw new Error('โหลดรายการเนื้อหาไม่สำเร็จ');manifest=await response.json();addEventListener('hashchange',()=>{if(location.hash==='#main'){document.querySelector<HTMLElement>('#main')?.focus();return;}render();});await render();}
 catch{app.innerHTML='<div class="empty-state"><h1>โหลดเนื้อหาไม่สำเร็จ</h1><p>ตรวจการเชื่อมต่อ แล้วลองรีเฟรชหน้านี้</p><button class="button" id="reload">โหลดใหม่</button></div>';document.querySelector('#reload')?.addEventListener('click',()=>location.reload());}
}
init();
