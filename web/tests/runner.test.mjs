import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import ts from 'typescript';
import { executeSuite } from '../src/runtime.js';

const compile = (s) => ts.transpileModule(s, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
const manifest = JSON.parse(fs.readFileSync(new URL('../public/content/manifest.json', import.meta.url)));
const run = (modules, sample = false) => vm.runInNewContext(`(${executeSuite.toString()})(${JSON.stringify({ modules, sample })})`, { URL, console: { log() {}, warn() {}, error() {} }, performance, setTimeout, clearTimeout });

test('wrong answers fail with expected/actual evidence', async () => {
  const result = await run({ './index': 'module.exports = () => "wrong"', './test': 'const f = require("./index"); test("reverse",()=>expect(f("abc")).toEqual("cba"))' });
  assert.equal(result.tests[0].status, 'fail');
  assert.match(result.tests[0].error, /cba/);
});

test('all reference AlgoCasts answers pass the original tests', async () => {
  let passed = 0, skipped = 0;
  for (const problem of manifest.problems.filter(p => p.source === 'AlgoCasts')) {
    const detail = JSON.parse(fs.readFileSync(new URL(`../public/content/problems/${problem.id}.json`, import.meta.url)));
    const modules = Object.fromEntries(Object.entries({ ...detail.modules, './index': detail.solution }).map(([k,v])=>[k,compile(v)]));
    const result = await run(modules);
    assert.equal(result.error, undefined, `${problem.id}: ${result.error}`);
    assert.equal(result.tests.filter(t=>t.status==='fail').length, 0, `${problem.id}: ${JSON.stringify(result.tests.filter(t=>t.status==='fail'))}`);
    passed += result.tests.filter(t=>t.status==='pass').length;
    skipped += result.tests.filter(t=>t.status==='skip').length;
  }
  assert.ok(passed >= 139);
  assert.equal(skipped, 0); // completed_exercises contains all current active tests
});

test('clean starters cannot pass functional test suites', async () => {
  for (const problem of manifest.problems) {
    const detail = JSON.parse(fs.readFileSync(new URL(`../public/content/problems/${problem.id}.json`, import.meta.url)));
    const result = await run(Object.fromEntries(Object.entries({ ...detail.modules, './index': detail.starter }).map(([k,v])=>[k,compile(v)])));
    assert.ok(result.error || result.tests.some(t=>t.status==='fail'), problem.id);
  }
});

test('all additional reference answers pass, including pagination and retry cases', async () => {
  for (const problem of manifest.problems.filter(p=>p.source!=='AlgoCasts')) {
    const detail = JSON.parse(fs.readFileSync(new URL(`../public/content/problems/${problem.id}.json`, import.meta.url)));
    const result = await run(Object.fromEntries(Object.entries({ ...detail.modules, './index': detail.solution }).map(([k,v])=>[k,compile(v)])));
    assert.equal(result.error, undefined, problem.id);
    assert.ok(result.tests.length > 0, problem.id);
    assert.equal(result.tests.filter(t=>t.status==='fail').length, 0, problem.id + ': ' + JSON.stringify(result.tests.filter(t=>t.status==='fail')));
  }
});

test('ordinary problems cannot access network', async () => {
  const result = await run({ './test': 'test("network", async()=> { await fetch("https://example.com") })' });
  assert.equal(result.tests[0].status, 'fail');
  assert.match(result.tests[0].error, /Network disabled/);
});

test('fixture fetch rejects external destinations and captures console output', async () => {
  const result = await run({ './test': 'const api = require("../api/index"); test("fixture", async()=>{await api.startChocolateApi(); console.log("hello"); await expect(async()=>fetch("https://example.com")).rejects.toThrow() })' });
  assert.equal(result.tests[0].status, 'pass');
  assert.ok(result.logs.includes('hello'));
});
