export const chocolateSolution = `export type ChocolateCategory = 'dark' | 'milk' | 'white' | 'ruby';
export interface CategoryReport { count: number; avgCacao: number; strongest: string }
export type ChocolateReport = Partial<Record<ChocolateCategory, CategoryReport>>;
export async function chocolateReport(baseUrl: string, minCacao: number): Promise<ChocolateReport> {
  const groups = new Map<string, {count:number; total:number; best:any}>();
  let page = 1, totalPages = 1;
  do {
    const url = new URL(baseUrl + '/api/chocolate-types');
    url.searchParams.set('minCacao', String(minCacao));
    url.searchParams.set('pageSize', '50');
    url.searchParams.set('page', String(page));
    let response;
    for (let retries = 0; ; retries++) {
      response = await fetch(url);
      if (response.status !== 503 || retries === 3) break;
    }
    if (!response.ok) throw new Error('Request failed with status ' + response.status);
    const body = await response.json();
    for (const item of body.data) {
      const group = groups.get(item.category) || {count:0,total:0,best:item};
      group.count++; group.total += item.cacaoPercent;
      if (item.cacaoPercent > group.best.cacaoPercent ||
          (item.cacaoPercent === group.best.cacaoPercent && item.id < group.best.id)) group.best = item;
      groups.set(item.category, group);
    }
    totalPages = body.meta.totalPages;
    page++;
  } while (page <= totalPages);
  return Object.fromEntries([...groups].map(([key,g]) => [key, {
    count:g.count, avgCacao:Math.round(g.total / g.count * 100) / 100, strongest:g.best.name
  }]));
}`;
const tasks = [
 ['insert-at-head','Insert at Beginning','Linked List','Easy','เพิ่ม node ที่หัว Singly Linked List แล้วคืน head ใหม่',
  'head: any, data: number','any','insertAtHead','return { data, next: head };',
  [['เพิ่มหัว','expect(f({data:10,next:null},5)).toEqual({data:5,next:{data:10,next:null}})'],['ลิสต์ว่าง','expect(f(null,7)).toEqual({data:7,next:null})']],
  'สร้าง node ใหม่ แล้วชี้ next ไปที่ head เดิม','O(1) time · O(1) space'],
 ['two-sum','Two Sum','String & Array','Easy','คืน index สองตำแหน่งที่ต่างกันซึ่งผลบวกเท่ากับ target; ถ้าไม่มีคืน []',
  'nums: number[], target: number','number[]','twoSum',
  'const seen = new Map<number,number>(); for(let i=0;i<nums.length;i++){ const other=target-nums[i]; if(seen.has(other))return [seen.get(other)!,i]; seen.set(nums[i],i); } return [];',
  [['ตัวอย่าง','expect(f([2,7,11,15],9).sort((a,b)=>a-b)).toEqual([0,1])'],['ค่าซ้ำคนละตำแหน่ง','expect(f([3,3],6).sort((a,b)=>a-b)).toEqual([0,1])'],['จำนวนลบ','expect(f([-1,-2,-3],-5).sort((a,b)=>a-b)).toEqual([1,2])'],['ไม่มีคำตอบ','expect(f([1,2],8)).toEqual([])']],
  'เก็บค่าที่เคยเห็นใน Map แล้วหา target - current','O(n) time · O(n) space'],
 ['group-anagrams','Group Anagrams','String & Array','Medium','จัดกลุ่มคำที่ประกอบด้วยตัวอักษรชุดเดียวกัน; ลำดับกลุ่มและคำไม่สำคัญ',
  'words: string[]','string[][]','groupAnagrams',
  "const groups = new Map<string,string[]>(); for(const word of words){const key=word.split('').sort().join(''); if(!groups.has(key))groups.set(key,[]);groups.get(key)!.push(word);} return [...groups.values()];",
  [['จัดกลุ่ม','expect(norm(f(["eat","tea","tan","ate","nat","bat"]))).toEqual(norm([["eat","tea","ate"],["tan","nat"],["bat"]]))'],['คำว่าง','expect(f(["",""])).toEqual([["",""]])'],['ไม่มีข้อมูล','expect(f([])).toEqual([])']],
  'ใช้คำที่เรียงตัวอักษรแล้วเป็น key ของ Map','O(n · k log k) time · O(nk) space'],
 ['search-insert','Search Insert Position','Searching','Easy','หา index แรกที่ค่า >= target ใน array เรียงจากน้อยไปมาก; ถ้าไม่มีคืน length',
  'nums: number[], target: number','number','searchInsert',
  'let left=0,right=nums.length; while(left<right){const mid=Math.floor((left+right)/2);if(nums[mid]<target)left=mid+1;else right=mid;} return left;',
  [['พบค่า','expect(f([1,3,5,6],5)).toEqual(2)'],['แทรกตรงกลาง','expect(f([1,3,5,6],2)).toEqual(1)'],['ค่าซ้ำ','expect(f([1,3,3,8],3)).toEqual(1)'],['array ว่าง','expect(f([],5)).toEqual(0)'],['ท้าย array','expect(f([1,3],9)).toEqual(2)']],
  'ใช้ Binary Search แบบช่วง [left, right) เพื่อหา lower bound','O(log n) time · O(1) space'],
 ['binary-search','Binary Search','Searching','Easy','หา index ของ target ใน array เรียงจากน้อยไปมากที่ไม่มีค่าซ้ำ; ไม่พบคืน -1',
  'nums: number[], target: number','number','binarySearch',
  'let left=0,right=nums.length-1; while(left<=right){const mid=left+Math.floor((right-left)/2);if(nums[mid]===target)return mid;if(nums[mid]<target)left=mid+1;else right=mid-1;} return -1;',
  [['พบค่า','expect(f([-1,0,3,5,9,12],9)).toEqual(4)'],['ไม่พบค่า','expect(f([-1,0,3,5,9,12],2)).toEqual(-1)'],['array ว่าง','expect(f([],10)).toEqual(-1)'],['สมาชิกเดียว','expect(f([2],2)).toEqual(0)']],
  'ตัดช่วงค้นหาครึ่งหนึ่งทุกครั้ง โดยระวังเงื่อนไข left <= right','O(log n) time · O(1) space'],
 ['top-k-frequent','Top K Frequent Elements','String & Array','Medium','คืนตัวเลข k ตัวที่มีความถี่สูงสุด; รับประกันว่าความถี่ตรงจุดตัดไม่เสมอกัน; k=0 คืน [] และลำดับผลลัพธ์ไม่สำคัญ',
  'nums: number[], k: number','number[]','topKFrequent',
  'if(k<=0)return []; const counts=new Map<number,number>(); for(const n of nums)counts.set(n,(counts.get(n)||0)+1); const buckets:number[][]=Array.from({length:nums.length+1},()=>[]);for(const [n,c] of counts)buckets[c].push(n); const result:number[]=[];for(let c=buckets.length-1;c>=0;c--){for(const n of buckets[c]){result.push(n);if(result.length===k)return result;}}return result;',
  [['ความถี่สูงสุด','expect(f([1,1,1,2,2,3],2).sort((a,b)=>a-b)).toEqual([1,2])'],['เลือกหนึ่งค่า','expect(f([4,4,5,5,5,6],1)).toEqual([5])'],['k เป็นศูนย์','expect(f([1,1,2],0)).toEqual([])']],
  'นับความถี่แล้วใช้ bucket index เป็นจำนวนครั้ง','O(n) time · O(n) space'],
];
export const extraProblems = tasks.map(([id,title,category,difficulty,description,args,result,name,body,cases,hint,complexity])=>({
 id,title,category,difficulty,description,hint,complexity,source:'Coding Practice',
 starter:`export function ${name}(${args}): ${result} {\n  // TODO: เขียนคำตอบที่นี่\n  throw new Error('TODO');\n}`,
 solution:`export function ${name}(${args}): ${result} {\n  ${body}\n}`,
 modules:{'./test':`import { ${name} as f } from './index';\nfunction norm(groups: string[][]) {return groups.map(g=>g.slice().sort()).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));}\n${cases.map(([label,assertion])=>`test(${JSON.stringify(label)},()=>{${assertion}});`).join('\n')}`},
 directions:`${description}\n\nตัวอย่างและกรณีขอบ ดูแท็บ “ชุดทดสอบ”\n\nข้อฝึกนี้อิงรูปแบบมาตรฐานจาก Coding Practice Session #01 ไม่ใช่ข้อสอบทางการ`,
 sourcePath:'competency/CODING/coding_practice_session_01',guideGroup:category==='Linked List'?'06':'02',
}));
