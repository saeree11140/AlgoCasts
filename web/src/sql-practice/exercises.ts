export const sqlMaxLength = 12_000;

export const tables = {
  departments: ['id', 'name'],
  employees: ['id', 'name', 'department_id', 'salary', 'status', 'bonus'],
} as const;

export interface Fixture {
  departments: [id: number, name: string][];
  employees: [id: number, name: string, departmentId: number | null, salary: number, status: string, bonus: number | null][];
}

export const fixtures: [Fixture, Fixture] = [
  {
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
  {
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
];

export interface Exercise {
  id: string;
  title: string;
  topic: string;
  prompt: string;
  columns: string[];
  hint: string;
  solution: string;
}

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
];
