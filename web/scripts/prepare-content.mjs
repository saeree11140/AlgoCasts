import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import ts from 'typescript';
import { catalog, competencyInfo, diagramGroups } from './catalog.mjs';
import { extraProblems, chocolateSolution } from './practice.mjs';
import { renderDiagram } from './render-diagram.mjs';
import { renderCompetencyMarkdown } from './render-competency-markdown.mjs';
const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.dirname(web);
const out = path.join(web, 'public/content');
await fs.mkdir(out, { recursive: true });
for (const folder of ['problems','documents','diagrams']) await fs.mkdir(path.join(out,folder), {recursive:true});
const read = p => fs.readFile(path.join(root,p),'utf8');
const write = (p,data) => fs.writeFile(path.join(out,p),typeof data==='string'?data:JSON.stringify(data));
export function cleanStarter(source) {
 const file = ts.createSourceFile('index.ts',source,ts.ScriptTarget.Latest,true);
 const edits=[];
 function visit(node) {
  if ((ts.isFunctionDeclaration(node)||ts.isMethodDeclaration(node)||ts.isConstructorDeclaration(node)||ts.isGetAccessor(node)||ts.isSetAccessor(node)) && node.body) {
   edits.push([node.body.getStart(file),node.body.end,'{\n    // TODO: เขียนคำตอบที่นี่\n    throw new Error("TODO");\n  }']);
   return;
  }
  if (ts.isPropertyDeclaration(node) && node.initializer) edits.push([node.initializer.getStart(file),node.initializer.end,'undefined as never']);
  ts.forEachChild(node,visit);
 }
 visit(file);
 for(const [start,end,text] of edits.sort((a,b)=>b[0]-a[0])) source=source.slice(0,start)+text+source.slice(end);
 // Print AST without comments so commented-out alternative solutions do not leak.
 return '// เขียนคำตอบ แล้วกดรันทดสอบ\n'+ts.createPrinter({removeComments:true}).printFile(ts.createSourceFile('index.ts',source,ts.ScriptTarget.Latest,true)).replace(/throw new Error\("TODO"\);/g,'// TODO: เขียนคำตอบที่นี่\n    throw new Error("TODO");');
}
const problems=[];
for(const [id, [title,category,difficulty,description,hint,complexity,source='AlgoCasts']] of Object.entries(catalog)) {
 const solution=await read(`completed_exercises/${id}/index.ts`);
 const original=await read(`exercises/${id}/index.ts`);
 const directions=(original.match(/\/\/ --- Directions([\s\S]*?)(?=\n(?:function|class|import|export|const|let)\b)/)?.[1]||'').replace(/^\/\/ ?/gm,'').trim();
 const modules={};
 for(const f of await fs.readdir(path.join(root,'completed_exercises',id))) if(f.endsWith('.ts')&&f!=='index.ts') modules[`./${f.slice(0,-3)}`]=await read(`completed_exercises/${id}/${f}`);
 const meta={id,title,category,difficulty,description,hint,complexity,source};
 let starter=cleanStarter(solution);
 if(id==='fib') starter='function fib(n: number): number {\n  // TODO: เขียนคำตอบที่นี่\n  throw new Error("TODO");\n}\n\nexport = fib;\n';
 const guideOverrides={chunk:'03',anagrams:'03',capitalize:'03',matrix:'03',fib:'04',midpoint:'07',circular:'07',fromlast:'07'};
 const content={...meta,starter,solution,modules,directions,sourcePath:`exercises/${id}`,guideGroup: guideOverrides[id]??(id==='sorting'?'10':category==='Searching'?'11':category==='Tree & BST'?'08':category==='Linked List'?'06':category==='Stack & Queue'?'05':category==='Events'?'09':category==='Loop & Recursion'?'03':'02')};
 if(id==='linkedlist') content.reference=await read('exercises/linkedlist/directions.html');
 await write(`problems/${id}.json`, content);problems.push(meta);
}
const chocolateStarter=await read('chocolatestype/client/index.ts');
const chocolate={id:'chocolate-report',title:'Chocolate Report',category:'API Challenges',difficulty:'Medium',description:'ดึงข้อมูล API ทุกหน้า กรองเปอร์เซ็นต์โกโก้ แล้วสรุป count, avgCacao และ strongest ตาม category',hint:'ส่ง minCacao และ pageSize=50 ไป API; แยก retry ของแต่ละหน้า แล้วสะสมผลก่อนสรุป',complexity:'O(n) time · O(c) aggregation space',source:'API Lab',starter:chocolateStarter,solution:chocolateSolution,modules:{'./test':await read('chocolatestype/client/test.ts')},directions:await read('chocolatestype/README.md'),markdown:true,sourcePath:'chocolatestype/client',guideGroup:'09'};
await write('problems/chocolate-report.json',chocolate);problems.push(Object.fromEntries(Object.entries(chocolate).filter(([k])=>['id','title','category','difficulty','description','source'].includes(k))));
for(const p of extraProblems) { await write(`problems/${p.id}.json`,p); problems.push(Object.fromEntries(Object.entries(p).filter(([k])=>['id','title','category','difficulty','description','source'].includes(k)))); }
// Tent Packing: copied from the exam-dev-2025 prep project (README + reference solution) with a web test suite.
const tentSolution=await read('competency/CODING/tent_packing/src/tentPacking.ts');
const tentDirections=[
 'บริษัทจะจัดแคมป์พนักงาน มีพนักงานทั้งหมด `numPeople` คน และมีเต็นท์หลายขนาดใน `tentSizes` (เช่น `[2, 5, 6]`) เต็นท์แต่ละขนาดใช้ได้ไม่จำกัดจำนวน',
 'จงจัดคนลงเต็นท์ให้พอดีทุกเต็นท์ (exact fit) โดยใช้จำนวนเต็นท์น้อยที่สุด ห้ามใส่เกินความจุ และต้องจัดครบทุกคน',
 '','### Input',
 '- `numPeople: number` — จำนวนพนักงาน เป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป',
 '- `tentSizes: number[]` — ความจุของเต็นท์แต่ละแบบ เป็นจำนวนเต็มบวก ไม่เรียงลำดับ อาจมีค่าซ้ำ หรือเป็น array ว่าง',
 '','### Output',
 '- `{ count: number; sizes: number[] }` — `count` คือจำนวนเต็นท์ที่น้อยที่สุด ส่วน `sizes` คือขนาดเต็นท์ที่ใช้ เรียงจากมากไปน้อย ผลรวมต้องเท่ากับ `numPeople` พอดี',
 '- `-1` — ถ้าจัดให้พอดีไม่ได้',
 '','### ตัวอย่าง','```ts',
 'minTentPacking(10, [2, 5, 6])\n// → { count: 2, sizes: [5, 5] }   (6+2+2 ก็พอดี แต่ใช้ 3 เต็นท์)',
 '','minTentPacking(9, [5, 6])\n// → -1   (ไม่มีชุดไหนรวมได้ 9 พอดี)',
 '','minTentPacking(11, [5, 6])\n// → { count: 2, sizes: [6, 5] }   (ต้องผสมหลายขนาด)',
 '```',
 '','### เงื่อนไขและกรณีขอบ',
 '- `numPeople` เป็น 0 ให้คืน `{ count: 0, sizes: [] }`',
 '- `tentSizes` อาจมีค่าซ้ำ เช่น `[2, 5, 5, 6]` ให้ถือเป็นขนาดเดียวกัน',
 '- ถ้ามีหลายชุดที่ใช้จำนวนเต็นท์น้อยที่สุดเท่ากัน คืนชุดไหนก็ได้ แต่ `sizes` ต้องเรียงจากมากไปน้อย',
 '- เลือกเต็นท์ใหญ่สุดก่อนเสมอ (Greedy) ไม่ผ่านทุกเคส เช่น `minTentPacking(12, [9, 6, 1])` Greedy ได้ 9+1+1+1 แต่คำตอบคือ 6+6',
 '- มีเคสที่ `numPeople` ใหญ่ถึงหลักหมื่น ควรทำได้ใน O(numPeople × จำนวนขนาดเต็นท์)',
 '- ดูทุกเคสได้ที่แท็บ “ชุดทดสอบ”',
 '','> โจทย์และเคส 1–10 มาจากชุดเตรียมสอบ Tent Packing (exam-dev-2025) ไม่ใช่ข้อสอบทางการ',
].join('\n');
const tent={id:'tent-packing',title:'Tent Packing',category:'Dynamic Programming',difficulty:'Medium',
 description:'จัดพนักงานลงเต็นท์ให้พอดีทุกคนโดยใช้เต็นท์น้อยที่สุด ถ้าจัดพอดีไม่ได้ให้คืน -1',
 hint:'ให้ dp[i] คือจำนวนเต็นท์น้อยที่สุดที่จัด i คนได้พอดี เริ่มจาก dp[0] = 0 แล้ว dp[i] = min(dp[i - size] + 1) ทุกขนาด เก็บว่าใช้ขนาดไหนไว้ใน parent[i] เพื่อย้อนหาชุดเต็นท์ ลบขนาดที่ซ้ำและเรียงจากมากไปน้อยก่อน',
 complexity:'O(n · k) time · O(n) space (n = numPeople, k = จำนวนขนาดเต็นท์ที่ไม่ซ้ำ)',source:'Coding Practice',
 starter:cleanStarter(tentSolution),solution:tentSolution,modules:{'./test':await read('competency/CODING/tent_packing/web-practice-suite.ts')},
 directions:tentDirections,markdown:true,sourcePath:'competency/CODING/tent_packing',guideGroup:'04'};
await write('problems/tent-packing.json',tent);problems.push(Object.fromEntries(Object.entries(tent).filter(([k])=>['id','title','category','difficulty','description','source'].includes(k))));
// Practice sets list their competencies in exam-data; fall back to the ones the review notes cover.
const examSections=(exam,review)=>JSON.parse(exam).competencies??[...new Set(Object.values(review?JSON.parse(review).levels:{}).flat().map(r=>r.competency))];
const competencies=[];
for(const [entry,[id,title,description,abbr]] of Object.entries(competencyInfo)) {
 // A key is a folder (first .html inside) or a specific HTML or Markdown document.
 const file=/\.(html|md)$/.test(entry)?entry:path.posix.join(entry,(await fs.readdir(path.join(root,'competency',entry))).find(f=>f.endsWith('.html')));
 const sourcePath=`competency/${file}`;
 const source=await read(sourcePath);
 const html=file.endsWith('.md')?renderCompetencyMarkdown(source,title):source;
 await write(`documents/${id}.html`,html);
 const text=s=>s.replace(/<[^>]*>/g,'').trim();
 const levels=[...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map(m=>text(m[1]));
 // Most documents group topics under "ระดับ ..." h2 headings; others (Cloud) tag the level inside each topic.
 const topics=[...html.matchAll(/<section class="topic"[^>]*>(?:(?!<\/section>)[\s\S])*?<h3[^>]*>([\s\S]*?)<\/h3>/g)].map(m=>text(m[1]));
 // Script-rendered exam sets keep their content in a JSON question bank instead of headings.
 const jsonScript=id=>html.match(new RegExp(`<script(?=[^>]*\\bid="${id}")(?=[^>]*\\btype="application/json")[^>]*>([\\s\\S]*?)</script>`))?.[1];
 const bank=jsonScript('question-bank');
 const meta=html.match(/^const META = (\{.*\});?$/m)?.[1];
 const [exam,review]=['exam-data','review-data'].map(jsonScript);
 const sections=levels.some(s=>s.startsWith('ระดับ'))?levels:topics.length?topics
  :bank?JSON.parse(bank).competencies.map(c=>c.title)
  :meta?(({competencies,coding})=>[...competencies,...coding].map(c=>c.name))(JSON.parse(meta))
  :exam?examSections(exam,review)
  :levels; // plain documents with one <h2> per part
 competencies.push({id,title,description,abbr,path:`documents/${id}.html`,sections,sourcePath});
}
await fs.copyFile(path.join(root,'competency/exploring-js-screen-2024-09-03.pdf'),path.join(out,'documents/exploring-js.pdf'));
for(const [from,to] of [['competency/CODING/coding_practice_session_01/Coding_Practice_6_Problems_Explained.md','coding-practice.md'],['competency/CODING/hackerrank-chocolate-pagination.md','chocolate-score.md']]) await write(`documents/${to}`,await read(from));
const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const decode = s => s.replace(/&(?:amp|lt|gt|quot|apos|nbsp|#\d+|#x[\da-f]+);/gi,c=> {const named={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' '};return named[c]??String.fromCodePoint(c.startsWith('&#x')?parseInt(c.slice(3),16):parseInt(c.slice(2),10));});
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
const diagrams=[];
for(const group of Object.keys(diagramGroups)) {
 const xml=await read(`diagrams/${group}/diagrams.xml`);
 let index=0;
 for(const match of xml.matchAll(/<diagram\b([^>]*)>([\s\S]*?)<\/diagram>/g)) {
  const title=attrs(match[1]).name||`Diagram ${++index}`;
  const graph=match[2].trim().startsWith('<')?match[2]:decodeURIComponent(inflateRawSync(Buffer.from(match[2].trim(),'base64')).toString());
  const id=`${group}-${String(diagrams.filter(d=>d.group===group).length+1).padStart(2,'0')}`;
  const {svg}=renderDiagram(graph,title);
  await write(`diagrams/${id}.svg`,svg);diagrams.push({id,group,title,category:diagramGroups[group],path:`diagrams/${id}.svg`});
 }
}
await write('manifest.json',{version:1,problems,competencies,diagrams,diagramGroups});
console.log(`Content ready: ${problems.length} problems · ${competencies.length} competency topics · ${diagrams.length} diagrams`);
