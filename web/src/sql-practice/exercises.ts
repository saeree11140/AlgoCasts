export const sqlMaxLength = 12_000;

export type Cell = string | number | null;

export interface Column {
  name: string;
  type: string;
  note?: string;
}

export interface Dataset {
  /** Table columns in display order; `ddl` must create the same tables. */
  tables: Record<string, Column[]>;
  ddl: string;
  /** cases[0] is the visible sample; every case is used when checking an answer. */
  cases: {label: string; rows: Record<string, Cell[][]>}[];
}

const staffDataset: Dataset = {
  tables: {
    departments: [{name: 'id', type: 'INT'}, {name: 'name', type: 'VARCHAR'}],
    employees: [
      {name: 'id', type: 'INT'}, {name: 'name', type: 'VARCHAR'}, {name: 'department_id', type: 'INT'},
      {name: 'salary', type: 'INT'}, {name: 'status', type: 'VARCHAR'}, {name: 'bonus', type: 'INT'},
    ],
  },
  ddl: `
    CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE employees (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, department_id INTEGER REFERENCES departments(id),
      salary INTEGER NOT NULL, status TEXT NOT NULL, bonus INTEGER
    );`,
  cases: [
    {
      label: 'ข้อมูลตัวอย่าง',
      rows: {
        departments: [[10, 'Engineering'], [20, 'Finance'], [30, 'Support'], [40, 'HR']],
        employees: [
          [1, 'Mali', 10, 75000, 'ACTIVE', 5000],
          [2, 'Niran', 10, 75000, 'ACTIVE', null],
          [3, 'Pim', 20, 60000, 'ACTIVE', 0],
          [4, 'Korn', 20, 82000, 'INACTIVE', null],
          [5, 'Dao', 30, 48000, 'ACTIVE', null],
          [6, 'Ton', 30, 55000, 'ACTIVE', 2000],
          [7, 'Fah', null, 67000, 'ACTIVE', null],
          [8, 'Win', 10, 50000, 'INACTIVE', 1000],
        ],
      },
    },
    {
      label: 'ข้อมูลชุดที่ 2',
      rows: {
        departments: [[1, 'Product'], [2, 'Operations'], [3, 'Legal'], [4, 'Design']],
        employees: [
          [4, 'Pat', 1, 60000, 'ACTIVE', null],
          [9, 'Prae', 1, 60000, 'ACTIVE', 4000],
          [10, 'Jay', 1, 42000, 'ACTIVE', 0],
          [11, 'Lina', 2, 83000, 'INACTIVE', null],
          [12, 'Nan', 2, 64000, 'ACTIVE', 2000],
          [13, 'Kim', 4, 89000, 'INACTIVE', 3000],
          [14, 'Meen', null, 61000, 'ACTIVE', null],
          [15, 'Aom', null, 35000, 'ACTIVE', null],
        ],
      },
    },
  ],
};

export interface Exercise {
  id: string;
  title: string;
  topic: string;
  prompt: string;
  requirements?: string[];
  columns: string[];
  hint: string;
  solution: string;
  /** Defaults to the shared departments/employees data. */
  dataset?: Dataset;
  /** Expected result for dataset.cases[0], shown with the problem statement. */
  sampleOutput?: Cell[][];
  /** Also list this exercise on #/problems. */
  listing?: {difficulty: 'Easy' | 'Medium'; source: string; description: string; sourceNote: string};
}

export const datasetFor = (exercise: Exercise) => exercise.dataset ?? staffDataset;

export const exercises: Exercise[] = [
  {
    id: 'active-earners',
    title: 'คัดพนักงานตามเงินเดือน',
    topic: 'WHERE · ORDER BY',
    prompt: "หาพนักงานที่มีสถานะ ACTIVE และเงินเดือนตั้งแต่ 60,000 ขึ้นไป เรียงเงินเดือนจากมากไปน้อย ถ้าเท่ากันให้เรียงตาม id จากน้อยไปมาก",
    columns: ['name', 'salary'],
    hint: 'ใช้ AND เชื่อมสองเงื่อนไข แล้วกำหนดลำดับด้วยคอลัมน์สองตัวใน ORDER BY',
    solution: `SELECT name, salary FROM employees
WHERE status = 'ACTIVE' AND salary >= 60000
ORDER BY salary DESC, id ASC;`,
  },
  {
    id: 'active-by-department',
    title: 'นับพนักงานทุกแผนก',
    topic: 'LEFT JOIN · COUNT',
    prompt: 'แสดงทุกแผนกพร้อมจำนวนพนักงานสถานะ ACTIVE แม้แผนกนั้นจะมีพนักงานที่ ACTIVE อยู่ 0 คน เรียงตาม id ของแผนกจากน้อยไปมาก',
    columns: ['department', 'active_count'],
    hint: 'ใส่เงื่อนไขสถานะใน ON ของ LEFT JOIN แล้วนับด้วย COUNT(e.id) เพื่อให้แผนกที่ไม่มีแถวตรงกันได้ 0',
    solution: `SELECT d.name AS department, COUNT(e.id) AS active_count
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'ACTIVE'
GROUP BY d.id, d.name
ORDER BY d.id ASC;`,
  },
  {
    id: 'department-payroll',
    title: 'หาแผนกที่มีพนักงานอย่างน้อยสองคน',
    topic: 'GROUP BY · HAVING',
    prompt: 'หาแผนกที่มีพนักงานอย่างน้อย 2 คนโดยนับทุกสถานะ ไม่นับพนักงานที่ยังไม่มีแผนก แสดงรหัสแผนกและผลรวมเงินเดือน เรียงผลรวมจากมากไปน้อย แล้วใช้ department_id จากน้อยไปมากเมื่อผลรวมเท่ากัน',
    columns: ['department_id', 'total_salary'],
    hint: 'ใช้ WHERE กรอง department_id ที่เป็น NULL แล้วใช้ HAVING COUNT(*) >= 2 กรองกลุ่ม',
    solution: `SELECT department_id, SUM(salary) AS total_salary
FROM employees
WHERE department_id IS NOT NULL
GROUP BY department_id
HAVING COUNT(*) >= 2
ORDER BY total_salary DESC, department_id ASC;`,
  },
  {
    id: 'bonus-report',
    title: 'จัดกลุ่มเงินเดือนและแสดงโบนัส',
    topic: 'CASE · COALESCE',
    prompt: 'แสดงพนักงานทุกคน จัดกลุ่ม HIGH เมื่อเงินเดือนตั้งแต่ 75,000 ขึ้นไป MID เมื่อตั้งแต่ 60,000 ขึ้นไป และ LOW สำหรับที่เหลือ แสดงโบนัสเป็น 0 เมื่อไม่มีข้อมูล เรียงตาม id จากน้อยไปมาก',
    columns: ['name', 'salary_band', 'bonus_value'],
    hint: 'วางเงื่อนไขเงินเดือนสูงสุดไว้ก่อนใน CASE และใช้ COALESCE(bonus, 0)',
    solution: `SELECT name,
  CASE WHEN salary >= 75000 THEN 'HIGH'
       WHEN salary >= 60000 THEN 'MID'
       ELSE 'LOW' END AS salary_band,
  COALESCE(bonus, 0) AS bonus_value
FROM employees ORDER BY id ASC;`,
  },
  {
    id: 'above-average',
    title: 'หาเงินเดือนที่สูงกว่าค่าเฉลี่ย',
    topic: 'Subquery · AVG',
    prompt: 'หาพนักงานที่มีเงินเดือนสูงกว่าค่าเฉลี่ยของพนักงานทั้งหมด รวมทุกสถานะและคนที่ยังไม่มีแผนก เรียงตาม id จากน้อยไปมาก',
    columns: ['id', 'name', 'salary'],
    hint: 'ใช้ SELECT AVG(salary) FROM employees เป็น subquery ในเงื่อนไข WHERE',
    solution: `SELECT id, name, salary FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)
ORDER BY id ASC;`,
  },
  {
    id: 'top-by-department',
    title: 'เลือกผู้ที่มีเงินเดือนสูงสุดในแต่ละแผนก',
    topic: 'CTE · ROW_NUMBER',
    prompt: 'เลือกพนักงานเงินเดือนสูงสุดแผนกละ 1 คนจากทุกสถานะ ไม่นับคนที่ยังไม่มีแผนก ถ้าเงินเดือนสูงสุดเท่ากันให้เลือกคนที่ id น้อยที่สุด เรียงผลลัพธ์ตาม department_id จากน้อยไปมาก',
    columns: ['department_id', 'name', 'salary'],
    hint: 'ใช้ ROW_NUMBER() แบ่งตาม department_id แล้วเรียงตาม salary DESC, id ASC กรองอันดับ 1 ใน SELECT ชั้นนอก',
    solution: `WITH ranked AS (
  SELECT department_id, name, salary,
    ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC, id ASC) AS rn
  FROM employees WHERE department_id IS NOT NULL
)
SELECT department_id, name, salary FROM ranked
WHERE rn = 1 ORDER BY department_id ASC;`,
  },
  {
    id: 'department-employee-summary',
    title: 'Department Employee Summary',
    topic: 'LEFT JOIN · COUNT · ORDER BY',
    prompt: 'บริษัทแห่งหนึ่งมีข้อมูลแผนก (department) และพนักงาน (employee) ต้องการสร้างรายงานสรุปจำนวนพนักงานในแต่ละแผนก จงเขียน SQL Query เพื่อแสดงชื่อแผนกและจำนวนพนักงานในแผนกนั้น',
    requirements: [
      'แสดงทุกแผนก แม้แผนกนั้นจะไม่มีพนักงานก็ตาม',
      'แผนกที่ไม่มีพนักงานให้แสดงจำนวนเป็น 0',
      'เรียงจำนวนพนักงานจากมากไปน้อย (DESC)',
      'หากจำนวนพนักงานเท่ากัน ให้เรียงตามชื่อแผนกจาก A–Z (ASC)',
    ],
    columns: ['department_name', 'employee_count'],
    hint: 'เริ่มจาก department แล้ว LEFT JOIN employee เพื่อเก็บทุกแผนก นับด้วย COUNT(e.id) ไม่ใช่ COUNT(*) เพราะแผนกที่ไม่มีพนักงานยังมีแถวที่ฝั่ง employee เป็น NULL 1 แถว แล้ว GROUP BY d.id, d.name',
    solution: `SELECT d.name AS department_name, COUNT(e.id) AS employee_count
FROM department d
LEFT JOIN employee e ON e.department_id = d.id
GROUP BY d.id, d.name
ORDER BY employee_count DESC, d.name ASC;`,
    dataset: {
      tables: {
        department: [
          {name: 'id', type: 'INT', note: 'Primary Key'},
          {name: 'name', type: 'VARCHAR(100)', note: 'ชื่อแผนก'},
        ],
        employee: [
          {name: 'id', type: 'INT', note: 'Primary Key'},
          {name: 'name', type: 'VARCHAR(100)', note: 'ชื่อพนักงาน'},
          {name: 'department_id', type: 'INT', note: 'Foreign Key อ้างอิง department.id'},
        ],
      },
      ddl: `
        CREATE TABLE department (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
        CREATE TABLE employee (id INTEGER PRIMARY KEY, name TEXT NOT NULL, department_id INTEGER REFERENCES department(id));`,
      // Tied names sort the same in SQLite (binary) and MySQL (case-insensitive) collations.
      cases: [
        {
          label: 'ตัวอย่างจากโจทย์',
          rows: {
            department: [[1, 'IT'], [2, 'HR'], [3, 'Finance'], [4, 'Marketing'], [5, 'Sales'], [6, 'test']],
            employee: [
              [1, 'Alice', 1], [2, 'Bob', 1], [3, 'Charlie', 1], [4, 'David', 2], [5, 'Emma', 2],
              [6, 'Frank', 3], [7, 'Grace', 5], [8, 'Henry', 6], [9, 'Ivy', 6],
            ],
          },
        },
        {
          label: 'จำนวนเท่ากันหลายแผนก ต้องเรียงตามชื่อ ไม่ใช่ตาม id',
          rows: {
            department: [[1, 'Support'], [2, 'Legal'], [3, 'Design'], [4, 'Analytics'], [5, 'Operations']],
            employee: [
              [1, 'Ann', 1], [2, 'Ben', 1], [3, 'Cat', 2], [4, 'Dan', 2], [5, 'Eve', 3],
              [6, 'Fon', 3], [7, 'Gus', 4], [8, 'Hal', 5], [9, 'Ice', 5], [10, 'Jon', 5],
            ],
          },
        },
        {
          label: 'พนักงานที่ไม่มีแผนก (department_id เป็น NULL) และหลายแผนกที่ว่าง',
          rows: {
            department: [[1, 'Research'], [2, 'Admin'], [3, 'Quality'], [4, 'Logistics']],
            employee: [[1, 'Kai', 1], [2, 'Lek', 1], [3, 'May', null], [4, 'Nok', null], [5, 'Oat', null]],
          },
        },
        {
          label: 'ยังไม่มีพนักงานเลย ทุกแผนกต้องได้ 0',
          rows: {
            department: [[1, 'Sales'], [2, 'Engineering'], [3, 'Customer Care']],
            employee: [],
          },
        },
        {
          label: 'ชื่อพนักงานซ้ำกัน ต้องนับทุกคน',
          rows: {
            department: [[1, 'Platform'], [2, 'Mobile']],
            employee: [[1, 'Somchai', 1], [2, 'Somchai', 1], [3, 'Anan', 1], [4, 'Anan', 2], [5, 'Beam', 2]],
          },
        },
      ],
    },
    sampleOutput: [['IT', 3], ['HR', 2], ['test', 2], ['Finance', 1], ['Sales', 1], ['Marketing', 0]],
    listing: {
      difficulty: 'Easy',
      source: 'HackerRank',
      description: 'สรุปจำนวนพนักงานของทุกแผนก รวมแผนกที่ไม่มีพนักงาน (0) เรียงจำนวนมากไปน้อย แล้วตามชื่อแผนก A–Z',
      sourceNote: 'โจทย์จำลองสไตล์ HackerRank SQL เรียบเรียงจากโจทย์ที่ผู้สอบจำมา (Department Employee Count) ไม่ใช่โจทย์ต้นฉบับ',
    },
  },
];
