# MySQL SELECT Cheat Sheet — HackerRank SQL Coding

> เน้น **MySQL 8.0+** สำหรับข้อสอบ SQL Coding เวลาจำกัด พร้อมจุดต่างจาก PostgreSQL เฉพาะที่ควรรู้  
> เป้าหมาย: เปิดอ่านทบทวนบนมือถือ และใช้เป็น checklist ก่อนกด Run/Submit

## 0. โครง SELECT ที่ควรจำ

```sql
SELECT [DISTINCT] columns, aggregate_fn(...) AS alias
FROM table_a a
[INNER | LEFT] JOIN table_b b ON a.id = b.a_id
WHERE row_condition
GROUP BY group_columns
HAVING aggregate_condition
ORDER BY sort_column DESC
LIMIT 10 OFFSET 0;
```

**ลำดับคิด:** `FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT` (เป็นลำดับเชิงตรรกะโดยสรุป ไม่ใช่ลำดับทำงานจริงของ engine ทุกกรณี)

- `WHERE` กรอง **แถว** ก่อน aggregate; `HAVING` กรอง **กลุ่ม** หลัง aggregate
- `COUNT(*)` นับแถวทั้งหมด; `COUNT(col)` ไม่นับแถวที่ `col IS NULL`
- `ORDER BY` สำคัญเมื่อโจทย์ต้องการลำดับ หรือต้องเลือก top N
- ในข้อสอบให้ **ใช้ชื่อ column ตาม schema จริง** และกำหนด alias ตามโจทย์เป๊ะ

## 1. SELECT / WHERE / ORDER BY / LIMIT

```sql
SELECT id, name, salary
FROM employees
WHERE salary >= 50000
  AND department_id IN (1, 2, 3)
  AND name LIKE 'A%'
  AND terminated_at IS NULL
ORDER BY salary DESC, id ASC
LIMIT 10 OFFSET 20;
```

| Syntax | ความหมาย |
|---|---|
| `=`, `<>`, `>`, `>=`, `<`, `<=` | เปรียบเทียบ |
| `AND`, `OR`, `NOT` | เงื่อนไข; ใช้ `(...)` คุม precedence |
| `IN (1,2,3)` / `NOT IN (...)` | อยู่ในชุด / ไม่อยู่ในชุด |
| `BETWEEN 10 AND 20` | รวมค่าขอบทั้งสอง |
| `LIKE 'A%'` | ขึ้นต้น A (`%` = หลายตัว, `_` = หนึ่งตัว) |
| `IS NULL`, `IS NOT NULL` | ตรวจ NULL; **ห้าม**ใช้ `= NULL` |
| `DISTINCT` | ตัดแถวที่ค่าคอลัมน์ใน SELECT ซ้ำกัน |
| `LIMIT 10 OFFSET 20` | ข้าม 20 แถว เอา 10 แถว |

**ต่างจาก PostgreSQL:** MySQL รองรับ `LIMIT 20, 10` (offset, count) ด้วย; PostgreSQL ไม่รองรับรูปนี้ จึงควรใช้ `LIMIT 10 OFFSET 20` ซึ่งใช้ได้ทั้งคู่

### NULL และการเรียงลำดับ

```sql
-- เอาค่า NULL ไว้ท้าย เมื่อเรียงจากน้อยไปมาก
SELECT * FROM employees
ORDER BY salary IS NULL ASC, salary ASC;
```

- MySQL: `ORDER BY salary ASC` โดยทั่วไป NULL อยู่ก่อน, `DESC` NULL อยู่หลัง
- PostgreSQL: `ASC` โดยค่าเริ่มต้น NULL อยู่หลัง, `DESC` อยู่ก่อน; ระบุ `NULLS FIRST/LAST` ได้ตรง ๆ
- MySQL ไม่มี `ORDER BY ... NULLS LAST` ใน syntax ทั่วไป ให้ใช้ `IS NULL` ช่วย

## 2. JOIN (ออกบ่อยมาก)

```sql
-- JOIN เฉพาะแถวที่ match
SELECT e.name, d.name AS department
FROM employees e
JOIN departments d ON d.id = e.department_id;

-- เอา department ที่ไม่มี employee ด้วย
SELECT d.id, d.name, COUNT(e.id) AS employee_count
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id
GROUP BY d.id, d.name;

-- หา department ที่ไม่มี employee
SELECT d.id, d.name
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id
WHERE e.id IS NULL;

-- Self JOIN (employee -> manager)
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

**Pitfall:** ถ้า `LEFT JOIN` แล้วใส่ `WHERE e.status = 'ACTIVE'` แถวที่ไม่มี employee จะถูกตัดไปด้วย ถ้าต้องการรักษา department ทั้งหมด ให้ใส่ filter ฝั่งขวาใน `ON`:

```sql
LEFT JOIN employees e
  ON e.department_id = d.id AND e.status = 'ACTIVE'
```

**ต่างจาก PostgreSQL:** PostgreSQL รองรับ `FULL OUTER JOIN`; MySQL ไม่รองรับโดยตรง (บางกรณีใช้ `LEFT JOIN` + `RIGHT JOIN` ผ่าน `UNION` จำลองได้)

## 3. GROUP BY / HAVING / Aggregate

```sql
SELECT department_id,
       COUNT(*) AS total_employees,
       COUNT(bonus) AS employees_with_bonus,
       SUM(salary) AS total_salary,
       ROUND(AVG(salary), 2) AS avg_salary,
       MIN(salary) AS min_salary,
       MAX(salary) AS max_salary
FROM employees
WHERE status = 'ACTIVE'
GROUP BY department_id
HAVING COUNT(*) >= 3
ORDER BY total_employees DESC;
```

**จำให้แม่น**
- `COUNT(*)` ใน `LEFT JOIN` อาจนับแถว placeholder เป็น 1; ใช้ `COUNT(right_table.id)` เมื่อต้องการนับแถวที่ match จริง
- Aggregate ส่วนใหญ่ไม่รวม NULL ในการคำนวณ (`COUNT(*)` เป็นข้อยกเว้น)
- `SUM(...)` เมื่อไม่มีค่าที่ไม่ใช่ NULL อาจได้ `NULL`; ใช้ `COALESCE(SUM(...), 0)`
- ใส่ non-aggregate column ใน `GROUP BY` ตามสมควร อย่าอาศัยการเลือกค่าแบบกำกวม
- MySQL รุ่นใหม่เปิด `ONLY_FULL_GROUP_BY` เป็นค่าเริ่มต้น (มีข้อยกเว้นเรื่อง functional dependency); PostgreSQL ก็มีกฎเข้มงวดคล้ายกัน

### Conditional Aggregation

```sql
SELECT department_id,
       SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count,
       SUM(CASE WHEN salary >= 50000 THEN salary ELSE 0 END) AS high_salary_total
FROM employees
GROUP BY department_id;
```

## 4. CASE / NULL / Conditional Functions

```sql
SELECT name,
       CASE
         WHEN salary >= 100000 THEN 'HIGH'
         WHEN salary >= 50000 THEN 'MID'
         ELSE 'LOW'
       END AS salary_band,
       COALESCE(bonus, 0) AS bonus_value,
       NULLIF(score, 0) AS score_or_null
FROM employees;
```

| MySQL | PostgreSQL | แนะนำ |
|---|---|---|
| `IF(flag = 1, 'Y', 'N')` | `CASE WHEN ... THEN ... ELSE ... END` | ใช้ `CASE` ข้าม DB |
| `IFNULL(x, 0)` | `COALESCE(x, 0)` | ใช้ `COALESCE` ข้าม DB |
| `COALESCE(x, y, 0)` | เหมือนกัน | เลือกค่าแรกที่ไม่ NULL |
| `NULLIF(a, b)` | เหมือนกัน | คืน NULL เมื่อ a = b |

**ระวัง:** `NOT IN (subquery)` ถ้าผล subquery มี `NULL` อาจทำให้ไม่คืนแถวที่คาดหวัง; ใช้ `NOT EXISTS` มักปลอดภัยกว่า

## 5. Subquery / EXISTS / CTE

```sql
-- พนักงานเงินเดือนสูงกว่าค่าเฉลี่ยทั้งหมด
SELECT id, name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- Department ที่มี employee อย่างน้อยหนึ่งคน
SELECT d.id, d.name
FROM departments d
WHERE EXISTS (
  SELECT 1
  FROM employees e
  WHERE e.department_id = d.id
);

-- CTE: แยกส่วนคำนวณให้อ่านง่าย
WITH totals AS (
  SELECT department_id, SUM(salary) AS total_salary
  FROM employees
  GROUP BY department_id
)
SELECT * FROM totals
WHERE total_salary > 100000;
```

MySQL 8+ และ PostgreSQL รองรับ `WITH`, `EXISTS`, subquery เหล่านี้ในรูปแบบใกล้เคียงกัน

## 6. Window Functions (โจทย์ Top N / Rank / Latest Row)

```sql
-- อันดับเงินเดือนในแต่ละ department
SELECT id, department_id, salary,
       ROW_NUMBER() OVER (
         PARTITION BY department_id
         ORDER BY salary DESC, id ASC
       ) AS rn,
       RANK() OVER (
         PARTITION BY department_id ORDER BY salary DESC
       ) AS salary_rank,
       DENSE_RANK() OVER (
         PARTITION BY department_id ORDER BY salary DESC
       ) AS dense_rank
FROM employees;
```

| Function | กรณีคะแนนซ้ำ 100, 100, 90 |
|---|---|
| `ROW_NUMBER()` | 1, 2, 3 |
| `RANK()` | 1, 1, 3 |
| `DENSE_RANK()` | 1, 1, 2 |

### ล่าสุด 1 รายการต่อ customer (สำคัญ)

```sql
WITH ranked AS (
  SELECT o.*,
         ROW_NUMBER() OVER (
           PARTITION BY customer_id
           ORDER BY order_date DESC, id DESC
         ) AS rn
  FROM orders o
)
SELECT * FROM ranked WHERE rn = 1;
```

**ต่างจาก PostgreSQL:** PostgreSQL มี `DISTINCT ON (customer_id)` ที่เขียนสั้นกว่า แต่ **MySQL ไม่มี** ต้องใช้ `ROW_NUMBER()` หรือวิธีอื่นแทน

```sql
-- PostgreSQL ONLY (ห้ามใช้ใน MySQL)
SELECT DISTINCT ON (customer_id) *
FROM orders
ORDER BY customer_id, order_date DESC, id DESC;
```

**Pitfall:** ไม่สามารถใช้ `WHERE rn = 1` ใน SELECT ชั้นเดียวกับที่คำนวณ window function; ใช้ CTE/subquery ครอบก่อน

## 7. String Functions ที่เจอบ่อย

```sql
SELECT CONCAT(first_name, ' ', last_name) AS full_name,
       LOWER(name) AS lower_name,
       UPPER(name) AS upper_name,
       TRIM(name) AS trimmed,
       LENGTH(name) AS byte_length,
       CHAR_LENGTH(name) AS char_length,
       SUBSTRING(name, 1, 3) AS first_three_chars,
       REPLACE(name, 'old', 'new') AS renamed
FROM employees;
```

| ประเด็น | MySQL | PostgreSQL |
|---|---|---|
| ต่อข้อความ | `CONCAT(a, b)` | `a || b` หรือ `CONCAT(a,b)` |
| ตัวอักษรไม่สน case | `LIKE` ขึ้นกับ collation | `ILIKE` |
| ความยาวตัวอักษร | `CHAR_LENGTH(x)` | `CHAR_LENGTH(x)` |
| จำนวน bytes | `LENGTH(x)` | `OCTET_LENGTH(x)` |
| Regex match | `name REGEXP '^[A-Z]'` | `name ~ '^[A-Z]'` |
| Regex ไม่สน case | `REGEXP_LIKE(name, 'abc', 'i')` | `name ~* 'abc'` |

**Pitfall:** `CONCAT('A', NULL)` → MySQL ได้ `NULL`; PostgreSQL `CONCAT('A', NULL)` ได้ `'A'` (ข้าม NULL) แต่ `'A' || NULL` ได้ `NULL` ดังนั้นถ้าไม่ต้องการ NULL ให้ `COALESCE()` ก่อน

## 8. Date / Time Functions (จุดต่างที่ควรจำ)

| เป้าหมาย | MySQL | PostgreSQL |
|---|---|---|
| วันที่ปัจจุบัน | `CURDATE()` / `CURRENT_DATE` | `CURRENT_DATE` |
| เวลาปัจจุบัน | `NOW()` | `NOW()` |
| ปีจากวันที่ | `YEAR(created_at)` | `EXTRACT(YEAR FROM created_at)` |
| เดือนจากวันที่ | `MONTH(created_at)` | `EXTRACT(MONTH FROM created_at)` |
| ตัดเวลาเป็น date | `DATE(created_at)` | `created_at::date` หรือ `CAST(... AS date)` |
| บวก 7 วัน | `DATE_ADD(d, INTERVAL 7 DAY)` | `d + INTERVAL '7 days'` |
| ลบ 7 วัน | `DATE_SUB(d, INTERVAL 7 DAY)` | `d - INTERVAL '7 days'` |
| ต่างกันเป็นวัน | `DATEDIFF(end_date, start_date)` | `end_date::date - start_date::date` |
| ต่างกันเป็นชั่วโมง | `TIMESTAMPDIFF(HOUR, start_at, end_at)` | `EXTRACT(EPOCH FROM (end_at - start_at))/3600` |
| Format date | `DATE_FORMAT(d, '%Y-%m')` | `TO_CHAR(d, 'YYYY-MM')` |

```sql
-- MySQL: Orders ในช่วงวันที่แบบไม่เสี่ยงกับเวลาของ datetime
SELECT * FROM orders
WHERE created_at >= '2026-11-01'
  AND created_at < '2026-12-01';

-- MySQL: ยอดขายรายเดือน
SELECT DATE_FORMAT(order_date, '%Y-%m') AS order_month,
       SUM(amount) AS total
FROM orders
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY order_month;
```

แนะนำใช้ `>= start AND < next_day_or_month` มากกว่า `BETWEEN '2026-11-01' AND '2026-11-30'` สำหรับคอลัมน์ `DATETIME` เพราะ `BETWEEN` อาจตัดข้อมูลหลังเที่ยงคืนของวันสุดท้าย

## 9. CAST / Type / Boolean

```sql
SELECT CAST('123' AS UNSIGNED) AS number_value;
SELECT CAST('123.45' AS DECIMAL(10, 2)) AS price;
SELECT CAST(created_at AS DATE) AS created_date FROM orders;
```

- MySQL: integer casts ใช้ `SIGNED` / `UNSIGNED` ส่วน PostgreSQL ใช้ `INTEGER`, `BIGINT` หรือ `::integer`
- MySQL `TRUE`/`FALSE` มีค่าเทียบเท่า `1`/`0` ในการใช้งานทั่วไป และ `BOOLEAN` เป็น alias ของ `TINYINT(1)`; PostgreSQL มี native `BOOLEAN`
- MySQL identifier ใช้ backticks เช่น `` `order` ``; PostgreSQL ใช้ double quotes เช่น `"order"`; ถ้าเป็นไปได้เลี่ยง reserved words เป็นชื่อ column

## 10. UNION / UNION ALL

```sql
SELECT email FROM employees
UNION ALL
SELECT email FROM customers;
```

- `UNION` ลบแถวซ้ำ; `UNION ALL` เก็บแถวซ้ำและมักเหมาะกว่าเมื่อไม่ต้องตัดซ้ำ
- จำนวนคอลัมน์ของแต่ละ SELECT ต้องเท่ากัน และชนิดข้อมูลต้องเข้ากันได้
- `INTERSECT` / `EXCEPT` ใช้ได้ใน MySQL **8.0.31+** และ PostgreSQL; ถ้าไม่ทราบเวอร์ชัน HackerRank อย่าพึ่งพาสองคำสั่งนี้โดยไม่ตรวจสอบ

## 11. Pattern สำหรับโจทย์ HackerRank

### A. หาค่าสูงสุดอันดับ 2 (distinct)

```sql
SELECT MAX(salary) AS second_highest
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);
```

### B. ค้นหารายการซ้ำ

```sql
SELECT email, COUNT(*) AS total
FROM users
GROUP BY email
HAVING COUNT(*) > 1;
```

### C. Top 3 ในแต่ละกลุ่ม

```sql
WITH ranked AS (
  SELECT e.*,
         ROW_NUMBER() OVER (
           PARTITION BY department_id ORDER BY salary DESC, id
         ) AS rn
  FROM employees e
)
SELECT * FROM ranked WHERE rn <= 3;
```

> ถ้าโจทย์ต้องการ *ทุกคนที่ได้คะแนนเสมอกัน* ที่อันดับ 3 ให้พิจารณา `RANK()` / `DENSE_RANK()` แทน `ROW_NUMBER()` ตามนิยามอันดับในโจทย์

### D. หาลูกค้าที่ไม่มี order

```sql
SELECT c.id, c.name
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id
);
```

### E. นับยอดตามเงื่อนไขและจัดอันดับ

```sql
SELECT customer_id,
       COUNT(*) AS order_count,
       SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END) AS paid_total
FROM orders
GROUP BY customer_id
ORDER BY paid_total DESC, customer_id ASC;
```

## 12. เช็ก 10 ข้อก่อน Submit

- [ ] ชื่อ table / column ตรง schema (ใช้ auto-complete ตรวจ)
- [ ] จำนวนคอลัมน์, ชื่อ alias, column order ตรงโจทย์
- [ ] `INNER JOIN` หรือ `LEFT JOIN` ถูกต้อง
- [ ] เงื่อนไข table ฝั่งขวาของ `LEFT JOIN` อยู่ใน `ON` หากต้องเก็บแถวที่ไม่ match
- [ ] ใช้ `WHERE` และ `HAVING` ถูกตำแหน่ง
- [ ] Aggregate ถูกต้อง (`COUNT(*)` vs `COUNT(col)`, NULL)
- [ ] ต้องการ distinct rows หรือ distinct values?
- [ ] ต้องการ top N แบบตัด tie หรือรวม tie (`ROW_NUMBER` / `RANK` / `DENSE_RANK`)
- [ ] `ORDER BY` ตรงโจทย์ รวม tie-breaker
- [ ] เช็กกรณีข้อมูลว่าง / NULL / duplicate / เวลาใน datetime

## 13. ตารางต่าง MySQL vs PostgreSQL — จำแค่นี้ก่อนสอบ

| ประเด็น | **MySQL 8+ (ใช้สอบ)** | PostgreSQL |
|---|---|---|
| LIMIT แบบ offset, count | `LIMIT 20,10` | ไม่รองรับ; ใช้ `LIMIT 10 OFFSET 20` |
| case-insensitive pattern | `LIKE` เมื่อ collation เป็น CI | `ILIKE` |
| ต่อ string | `CONCAT(a,b)` | `a \|\| b` / `CONCAT(a,b)` |
| null fallback | `IFNULL(x,0)` / `COALESCE(x,0)` | `COALESCE(x,0)` |
| if expression | `IF(cond,a,b)` | `CASE WHEN ...` |
| date + n วัน | `DATE_ADD(d, INTERVAL 7 DAY)` | `d + INTERVAL '7 days'` |
| date difference | `DATEDIFF(end,start)` | `end::date - start::date` |
| ปี/เดือน | `YEAR(d)`, `MONTH(d)` | `EXTRACT(YEAR/MONTH FROM d)` |
| date format | `DATE_FORMAT(d,'%Y-%m')` | `TO_CHAR(d,'YYYY-MM')` |
| cast integer | `CAST(x AS SIGNED)` | `CAST(x AS INTEGER)` / `x::integer` |
| ล่าสุดต่อกลุ่ม | `ROW_NUMBER()` + CTE | `DISTINCT ON` หรือ `ROW_NUMBER()` |
| NULL sort placement | `ORDER BY x IS NULL, x` | `ORDER BY x NULLS LAST` |
| identifier quote | `` `col` `` | `"col"` |
| regex | `REGEXP` | `~`, `~*` |
| full outer join | ไม่มีโดยตรง | มี |

**ข้อสรุปสำหรับสอบ:** ถ้า editor MySQL ของ HackerRank มี schema auto-complete แต่ PostgreSQL ไม่มี ให้เลือก **MySQL** ตามสภาพแวดล้อมที่ทดสอบจริง และใช้เวลาทบทวนโจทย์ `JOIN`, aggregate, window functions และ NULL มากกว่าท่อง syntax ที่ต่างกันเล็กน้อย

---

### Official references

- MySQL SELECT: https://dev.mysql.com/doc/refman/8.4/en/select.html
- MySQL Window Functions: https://dev.mysql.com/doc/refman/8.4/en/window-functions-usage.html
- MySQL GROUP BY behavior: https://dev.mysql.com/doc/refman/8.4/en/group-by-handling.html
- MySQL Date and Time Functions: https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html
- PostgreSQL SELECT: https://www.postgresql.org/docs/current/sql-select.html
