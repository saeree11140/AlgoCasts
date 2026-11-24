import type {Database, QueryExecResult, SqlJsStatic, SqlValue} from 'sql.js';
import type {Cell, Dataset, Exercise} from './exercises';

export interface SqlAttempt {
  actual: QueryExecResult;
  expected?: QueryExecResult;
  checks?: boolean[];
  labels?: string[];
}

function setup(SQL: SqlJsStatic, dataset: Dataset, rows: Record<string, Cell[][]>) {
  const db = new SQL.Database();
  try {
    db.run(dataset.ddl);
    for (const [table, values] of Object.entries(rows)) {
      for (const row of values) db.run(`INSERT INTO ${table} VALUES (${row.map(() => '?').join(', ')})`, row);
    }
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

export function judgeSql(SQL: SqlJsStatic, exercise: Exercise, dataset: Dataset, query: string, check: boolean): SqlAttempt {
  const runCase = (index: number) => {
    const db = setup(SQL, dataset, dataset.cases[index].rows);
    try {
      const actual = select(db, query);
      return {actual, expected: check ? select(db, exercise.solution) : undefined};
    } finally {
      db.close();
    }
  };
  const sample = runCase(0);
  if (!check) return {actual: sample.actual};
  const checks = [matches(sample.actual, sample.expected!)];
  for (let i = 1; i < dataset.cases.length; i++) {
    const {actual, expected} = runCase(i);
    checks.push(matches(actual, expected!));
  }
  return {actual: sample.actual, expected: sample.expected, checks, labels: dataset.cases.map(item => item.label)};
}
