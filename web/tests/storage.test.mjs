import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../src/storage.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {validateBackup,load,save}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
test('corrupt or missing storage still opens an empty usable workspace',()=>{
 globalThis.localStorage={getItem:()=>'{broken'};
 assert.deepEqual(load(),{version:1,problems:{},read:[]});
 globalThis.localStorage={getItem:()=>{throw new Error('blocked')},setItem:()=>{throw new Error('full')}};
 assert.deepEqual(load(),{version:1,problems:{},read:[]});
 assert.equal(save(load()),false);
});
test('backup validates schema, bounds code and drops unsafe IDs',()=>{
 assert.throws(()=>validateBackup({version:2,problems:{},read:[]}));
 const result=validateBackup({version:1,problems:{'../../x':{solved:true},reversestring:{code:'a'.repeat(60000),solved:'yes',bookmarked:true,attempts:[{at:'now',passed:1,total:1,success:true}]}},read:['sql',{},'../../bad'],theme:'dark'});
 assert.deepEqual(Object.keys(result.problems),['reversestring']);
 assert.equal(result.problems.reversestring.code.length,50000);
 assert.equal(result.problems.reversestring.solved,false);
 assert.equal(result.problems.reversestring.bookmarked,true);
 assert.deepEqual(result.read,['sql']);
 assert.equal(result.theme,'dark');
});

test('SQL drafts and solved state survive backup validation',()=>{
 const saved={version:1,problems:{},read:[],sqlPractice:{
  'active-earners':{code:'SELECT name FROM employees',solved:true},
  '../unsafe':{code:'SELECT 1',solved:true},
 }};
 const result=validateBackup(JSON.parse(JSON.stringify(saved)));
 assert.deepEqual(Object.keys(result.sqlPractice),['active-earners']);
 assert.deepEqual(result.sqlPractice['active-earners'],saved.sqlPractice['active-earners']);
});
