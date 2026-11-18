import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import ts from 'typescript';
import { catalog, competencyInfo, diagramGroups } from './catalog.mjs';
import { extraProblems, chocolateSolution } from './practice.mjs';
import { renderDiagram } from './render-diagram.mjs';
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
const competencies=[];
for(const [folder,[id,title,description,abbr]] of Object.entries(competencyInfo)) {
 const file=(await fs.readdir(path.join(root,'competency',folder))).find(f=>f.endsWith('.html'));
 const html=await read(`competency/${folder}/${file}`);
 await write(`documents/${id}.html`,html);
 const text=s=>s.replace(/<[^>]*>/g,'').trim();
 const levels=[...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map(m=>text(m[1]));
 // Most documents group topics under "ระดับ ..." h2 headings; others (Cloud) tag the level inside each topic.
 const topics=[...html.matchAll(/<section class="topic"[^>]*>(?:(?!<\/section>)[\s\S])*?<h3[^>]*>([\s\S]*?)<\/h3>/g)].map(m=>text(m[1]));
 const sections=levels.some(s=>s.startsWith('ระดับ'))?levels:topics;
 competencies.push({id,title,description,abbr,path:`documents/${id}.html`,sections,sourcePath:`competency/${folder}/${file}`});
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
