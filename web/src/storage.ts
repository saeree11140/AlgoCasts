import type { SavedData } from './types';
const key='algocasts.study.v1';
const empty=():SavedData=>({version:1,problems:{},read:[]});
export function validateBackup(value: unknown): SavedData {
 if(!value||typeof value!=='object')throw new Error('รูปแบบไฟล์ไม่ถูกต้อง');
 const v=value as SavedData;
 if(v.version!==1||!v.problems||typeof v.problems!=='object'||Array.isArray(v.problems)||!Array.isArray(v.read))throw new Error('ไฟล์นี้ไม่ใช่ข้อมูล AlgoCasts รุ่นที่รองรับ');
 const clean=empty();
 for(const [id,p] of Object.entries(v.problems)) {
  if(!/^[a-z0-9-]+$/.test(id)||!p||typeof p!=='object')continue;
  clean.problems[id]={code:typeof p.code==='string'?p.code.slice(0,50000):undefined,solved:p.solved===true,bookmarked:p.bookmarked===true,
   attempts:Array.isArray(p.attempts)?p.attempts.filter(a=>a&&typeof a.at==='string'&&Number.isInteger(a.total)&&a.total>0&&Number.isInteger(a.passed)&&a.passed>=0&&a.passed<=a.total&&typeof a.success==='boolean').slice(-10):[],
   updatedAt:typeof p.updatedAt==='string'?p.updatedAt:undefined};
 }
 clean.read=v.read.filter(id=>typeof id==='string'&&/^[a-z0-9-]+$/.test(id));
 clean.lastProblem=typeof v.lastProblem==='string'&&/^[a-z0-9-]+$/.test(v.lastProblem)?v.lastProblem:undefined;
 clean.theme=v.theme==='dark'?'dark':'light';return clean;
}
export function load():SavedData {try {return validateBackup(JSON.parse(localStorage.getItem(key)||'null'));}catch{return empty();}}
export function save(data:SavedData):boolean {try{localStorage.setItem(key,JSON.stringify(data));return true;}catch{return false;}}
