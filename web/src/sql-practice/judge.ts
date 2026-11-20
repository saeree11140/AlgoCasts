import type {Database, QueryExecResult, SqlJsStatic, SqlValue} from 'sql.js';
import type {Exercise, Fixture} from './exercises';

export interface SqlAttempt {
  actual: QueryExecResult;
  expected?: QueryExecResult;
  checks?: boolean[];
}

function setup(SQL: SqlJsStatic, fixture: Fixture) {
  const db = new SQL.Database();
  try {
    db.run(`
      CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
      CREATE TABLE employees (
        id INTEGER PRIMARY KEY, name TEXT NOT NULL, department_id INTEGER REFERENCES departments(id),
        salary INTEGER NOT NULL, status TEXT NOT NULL, bonus INTEGER
      );
    `);
    for (const row of fixture.departments) db.run('INSERT INTO departments VALUES (?, ?)', row);
    for (const row of fixture.employees) db.run('INSERT INTO employees VALUES (?, ?, ?, ?, ?, ?)', row);
    db.run('PRAGMA query_only = ON');
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

function select(db: Database, sql: string): QueryExecResult {
  const withoutLeadingComments = sql.replace(/^(?:\s+|--[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)*/, '');
  if (!/^(SELECT|WITH)\b/i.test(withoutLeadingComments)) {
    throw new Error('ใส่คำสั่ง SELECT หรือ WITH ที่คืนผลลัพธ์เป็นตาราง');
  }
  const statements = db.iterateStatements(sql);
  const first = statements.next();
  if (first.done || !first.value) throw new Error('ใส่คำสั่ง SQL ก่อนรัน');
  const statement = first.value;
  const columns = statement.getColumnNames();
  if (columns.length === 0) throw new Error('คำสั่งต้องคืนผลลัพธ์เป็นตาราง');

  const values: SqlValue[][] = [];
  while (statement.step()) {
    if (values.length === 100) throw new Error('ผลลัพธ์เกิน 100 แถว ลองกรองข้อมูลหรือใช้ LIMIT');
    const row = statement.get();
    if (row.some(cell => (typeof cell === 'string' || cell instanceof Uint8Array) && cell.length > 2000)) {
      throw new Error('ผลลัพธ์ในเซลล์ยาวเกิน 2,000 ตัวอักษรหรือไบต์');
    }
    values.push(row);
  }
  if (!statements.next().done) throw new Error('รันได้ครั้งละหนึ่งคำสั่ง SQL');
  return {columns, values};
}

function matches(actual: QueryExecResult, expected: QueryExecResult) {
  return actual.columns.length === expected.columns.length
    && actual.values.length === expected.values.length
    && actual.values.every((row, i) => row.every((cell, j) => cell === expected.values[i][j]));
}

export function judgeSql(SQL: SqlJsStatic, exercise: Exercise, fixtures: [Fixture, Fixture], query: string, check: boolean): SqlAttempt {
  const sampleDb = setup(SQL, fixtures[0]);
  try {
    const actual = select(sampleDb, query);
    if (!check) return {actual};
    const expected = select(sampleDb, exercise.solution);
    const secondDb = setup(SQL, fixtures[1]);
    try {
      const secondActual = select(secondDb, query);
      const secondExpected = select(secondDb, exercise.solution);
      return {actual, expected, checks: [matches(actual, expected), matches(secondActual, secondExpected)]};
    } finally {
      secondDb.close();
    }
  } finally {
    sampleDb.close();
  }
}
