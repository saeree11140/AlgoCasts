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
const {exercises, datasetFor} = await loadModule('exercises');
const {judgeSql} = await loadModule('judge');
const judge = (exercise, query, check) => judgeSql(SQL, exercise, datasetFor(exercise), query, check);
const first = exercises[0];

test('all reference queries pass on every dataset', () => {
  for (const exercise of exercises) {
    const result = judge(exercise, exercise.solution, true);
    assert.deepEqual(result.checks, datasetFor(exercise).cases.map(() => true), exercise.id);
    assert.ok(result.expected.values.length > 0, exercise.id);
  }
});

test('grading accepts alternate SQL and aliases and enforces values, shape and row order', () => {
  const alternate = `WITH filtered AS (
    SELECT * FROM employees WHERE status = 'ACTIVE' AND salary >= 60000
  ) SELECT name AS employee, salary AS pay FROM filtered ORDER BY salary DESC, id;`;
  assert.deepEqual(judge(first, alternate, true).checks, [true, true]);
  const reversed = first.solution.replace('salary DESC', 'salary ASC');
  assert.deepEqual(judge(first, reversed, true).checks, [false, false]);
  assert.deepEqual(judge(first, 'SELECT name FROM employees', true).checks, [false, false]);
  assert.deepEqual(judge(first, 'SELECT name, salary FROM employees WHERE 0', true).checks, [false, false]);
});

test('sample-only execution includes column names for zero rows and skips grading', () => {
  const result = judge(first, '-- Empty result\nSELECT name, salary FROM employees WHERE 0;', false);
  assert.deepEqual(result, {actual: {columns: ['name', 'salary'], values: []}});
});

test('a hardcoded sample output fails on the second dataset', () => {
  const {actual} = judge(first, first.solution, false);
  const literalQuery = actual.values.map(([name, salary]) => `SELECT '${name}', ${salary}`).join(' UNION ALL ');
  assert.deepEqual(judge(first, literalQuery, true).checks, [true, false]);
});

test('SQL errors, writes and multiple statements are rejected', () => {
  assert.throws(() => judge(first, 'SELECT unknown FROM employees', false), /unknown/);
  assert.throws(() => judge(first, 'DROP TABLE employees', false), /SELECT/);
  assert.throws(() => judge(first, 'SELECT 1; SELECT 2', false), /หนึ่งคำสั่ง/);
  assert.throws(() => judge(first, 'WITH x AS (SELECT 1) DELETE FROM employees RETURNING id', false), /readonly/);
  assert.throws(() => judge(first, 'SELECT * FROM employees a, employees b, employees c', false), /100 แถว/);
});

test('department employee summary matches the sample output and rejects common mistakes', () => {
  const summary = exercises.find(exercise => exercise.id === 'department-employee-summary');
  assert.deepEqual(judge(summary, summary.solution, false).actual.values, summary.sampleOutput);
  const wrong = {
    'COUNT(*)': summary.solution.replace('COUNT(e.id)', 'COUNT(*)'),
    'INNER JOIN': summary.solution.replace('LEFT JOIN', 'JOIN'),
    'tie-break by id': summary.solution.replace('d.name ASC', 'd.id ASC'),
    'COUNT(DISTINCT name)': summary.solution.replace('COUNT(e.id)', 'COUNT(DISTINCT e.name)'),
    'employees without a department': `SELECT d.name AS department_name, COUNT(e.id) AS employee_count
      FROM employee e LEFT JOIN department d ON e.department_id = d.id
      GROUP BY d.id, d.name ORDER BY employee_count DESC, d.name ASC`,
  };
  for (const [mistake, query] of Object.entries(wrong)) {
    assert.ok(judge(summary, query, true).checks.includes(false), mistake);
  }
});
