import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import initSqlJs from 'sql.js';
import ts from 'typescript';

async function loadModule(file) {
  const source = readFileSync(new URL(`../src/sql-practice/${file}.ts`, import.meta.url), 'utf8');
  const {outputText} = ts.transpileModule(source, {
    compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext},
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}

const SQL = await initSqlJs();
const {exercises, fixtures} = await loadModule('exercises');
const {judgeSql} = await loadModule('judge');
const first = exercises[0];

test('all reference queries pass on both datasets', () => {
  for (const exercise of exercises) {
    const result = judgeSql(SQL, exercise, fixtures, exercise.solution, true);
    assert.deepEqual(result.checks, [true, true], exercise.id);
    assert.ok(result.expected.values.length > 0, exercise.id);
  }
});

test('grading accepts alternate SQL and aliases and enforces values, shape and row order', () => {
  const alternate = `WITH filtered AS (
    SELECT * FROM employees WHERE status = 'ACTIVE' AND salary >= 60000
  ) SELECT name AS employee, salary AS pay FROM filtered ORDER BY salary DESC, id;`;
  assert.deepEqual(judgeSql(SQL, first, fixtures, alternate, true).checks, [true, true]);
  const reversed = first.solution.replace('salary DESC', 'salary ASC');
  assert.deepEqual(judgeSql(SQL, first, fixtures, reversed, true).checks, [false, false]);
  assert.deepEqual(judgeSql(SQL, first, fixtures, 'SELECT name FROM employees', true).checks, [false, false]);
  assert.deepEqual(judgeSql(SQL, first, fixtures, 'SELECT name, salary FROM employees WHERE 0', true).checks, [false, false]);
});

test('sample-only execution includes column names for zero rows and skips grading', () => {
  const result = judgeSql(SQL, first, fixtures, '-- Empty result\nSELECT name, salary FROM employees WHERE 0;', false);
  assert.deepEqual(result, {actual: {columns: ['name', 'salary'], values: []}});
});

test('a hardcoded sample output fails on the second dataset', () => {
  const {actual} = judgeSql(SQL, first, fixtures, first.solution, false);
  const literalQuery = actual.values.map(([name, salary]) => `SELECT '${name}', ${salary}`).join(' UNION ALL ');
  assert.deepEqual(judgeSql(SQL, first, fixtures, literalQuery, true).checks, [true, false]);
});

test('SQL errors, writes and multiple statements are rejected', () => {
  assert.throws(() => judgeSql(SQL, first, fixtures, 'SELECT unknown FROM employees', false), /unknown/);
  assert.throws(() => judgeSql(SQL, first, fixtures, 'DROP TABLE employees', false), /SELECT/);
  assert.throws(() => judgeSql(SQL, first, fixtures, 'SELECT 1; SELECT 2', false), /หนึ่งคำสั่ง/);
  assert.throws(() => judgeSql(SQL, first, fixtures, 'WITH x AS (SELECT 1) DELETE FROM employees RETURNING id', false), /readonly/);
  assert.throws(() => judgeSql(SQL, first, fixtures, 'SELECT * FROM employees a, employees b, employees c', false), /100 แถว/);
});
