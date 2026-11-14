# HackerRank Mock Problem: Chocolate Type Score with Pagination

## Problem Statement

คุณได้รับ API endpoint สำหรับค้นหาข้อมูลรายการช็อกโกแลตจาก HackerRank Mock API

```text
https://jsonmock.hackerrank.com/chocolatestype
```

API นี้รองรับ pagination โดยสามารถระบุหน้าได้ด้วย query parameter `page`

```text
https://jsonmock.hackerrank.com/chocolatestype?page=1
```

ให้เขียนฟังก์ชันที่รับค่า:

```ts
function getHighestChocolateScore(multiplier: number[], chocolateType: string): Promise<number>
```

โดยต้อง fetch ข้อมูลจาก API ทุกหน้า แล้วค้นหาเฉพาะ chocolate ที่มี `type` ตรงกับ `chocolateType` จากนั้นคำนวณ score ของแต่ละรายการ และ return ค่า score ที่มากที่สุด

---

## API Response Format

ตัวอย่าง response จาก API:

```json
{
  "page": 1,
  "per_page": 10,
  "total": 30,
  "total_pages": 3,
  "data": [
    {
      "name": "Dark Almond Chocolate",
      "type": "dark",
      "ingredients": ["cocoa", "almond", "milk"],
      "someData": ["extra", "premium"],
      "nutritionInformation": {
        "sugar": {
          "amount": 12
        }
      }
    }
  ]
}
```

---

## Score Formula

ให้คำนวณ score ด้วยสูตรนี้:

```ts
score =
  (
    multiplier[0] * ingredients.length -
    multiplier[1] * someData.length
  ) / nutritionInformation.sugar.amount;
```

หรือเขียนเป็นสมการได้ว่า:

```text
score = ((multiplier[0] * ingredientCount) - (multiplier[1] * someDataCount)) / sugarAmount
```

---

## Example

### Input

```ts
multiplier = [10, 2]
chocolateType = "dark"
```

### Chocolate Item

```json
{
  "name": "Dark Almond Chocolate",
  "type": "dark",
  "ingredients": ["cocoa", "almond", "milk"],
  "someData": ["extra", "premium"],
  "nutritionInformation": {
    "sugar": {
      "amount": 12
    }
  }
}
```

### Calculation

```text
ingredients.length = 3
someData.length = 2
sugar.amount = 12

score = ((10 * 3) - (2 * 2)) / 12
score = (30 - 4) / 12
score = 26 / 12
score = 2.1667
```

---

## TypeScript Solution

```ts
type Chocolate = {
  name: string;
  type: string;
  ingredients: string[];
  someData: string[];
  nutritionInformation: {
    sugar: {
      amount: number;
    };
  };
};

type ApiResponse = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: Chocolate[];
};

async function getHighestChocolateScore(
  multiplier: number[],
  chocolateType: string
): Promise<number> {
  const baseUrl = "https://jsonmock.hackerrank.com/chocolatestype";

  let maxScore = -Infinity;

  // 1. Fetch หน้าแรกก่อน เพื่อดูว่า API มีทั้งหมดกี่หน้า
  const firstResponse = await fetch(`${baseUrl}?page=1`);
  const firstJson: ApiResponse = await firstResponse.json();

  // 2. คำนวณข้อมูลจากหน้าแรก
  for (const chocolate of firstJson.data) {
    if (chocolate.type !== chocolateType) {
      continue;
    }

    const score = calculateChocolateScore(chocolate, multiplier);

    if (score > maxScore) {
      maxScore = score;
    }
  }

  // 3. Fetch หน้าที่เหลือ ตั้งแต่หน้า 2 ถึง total_pages
  for (let page = 2; page <= firstJson.total_pages; page++) {
    const response = await fetch(`${baseUrl}?page=${page}`);
    const json: ApiResponse = await response.json();

    for (const chocolate of json.data) {
      if (chocolate.type !== chocolateType) {
        continue;
      }

      const score = calculateChocolateScore(chocolate, multiplier);

      if (score > maxScore) {
        maxScore = score;
      }
    }
  }

  return maxScore;
}

function calculateChocolateScore(
  chocolate: Chocolate,
  multiplier: number[]
): number {
  const ingredientCount = chocolate.ingredients.length;
  const someDataCount = chocolate.someData.length;
  const sugarAmount = chocolate.nutritionInformation.sugar.amount;

  return (
    multiplier[0] * ingredientCount -
    multiplier[1] * someDataCount
  ) / sugarAmount;
}
```

---

## Shorter Version

ถ้าต้องการเขียนให้สั้นขึ้น สามารถรวม logic ไว้ใน loop เดียวได้แบบนี้:

```ts
async function getHighestChocolateScore(
  multiplier: number[],
  chocolateType: string
): Promise<number> {
  const baseUrl = "https://jsonmock.hackerrank.com/chocolatestype";

  let maxScore = -Infinity;
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages) {
    const response = await fetch(`${baseUrl}?page=${currentPage}`);
    const json: ApiResponse = await response.json();

    totalPages = json.total_pages;

    for (const chocolate of json.data) {
      if (chocolate.type !== chocolateType) {
        continue;
      }

      const score =
        (
          multiplier[0] * chocolate.ingredients.length -
          multiplier[1] * chocolate.someData.length
        ) / chocolate.nutritionInformation.sugar.amount;

      maxScore = Math.max(maxScore, score);
    }

    currentPage++;
  }

  return maxScore;
}
```

---

## Key Points สำหรับทำข้อสอบ HackerRank

### 1. ต้อง fetch ทุกหน้า

ห้ามคิดแค่หน้าแรก เพราะข้อมูลที่ score สูงสุดอาจอยู่หน้าหลัง ๆ

```ts
for (let page = 1; page <= total_pages; page++) {
  // fetch each page
}
```

### 2. ต้อง filter ตาม chocolateType ก่อน

```ts
if (chocolate.type !== chocolateType) {
  continue;
}
```

### 3. ใช้ `Math.max` เพื่อหา score สูงสุด

```ts
maxScore = Math.max(maxScore, score);
```

### 4. ระวังการสะกด field

ในโจทย์จริงต้องดูชื่อ field ให้ตรงกับ JSON จริง เช่น:

```ts
ingredients.length
nutritionInformation.sugar.amount
```

ไม่ใช่:

```ts
ingredient.lenght
```

คำที่ถูกต้องคือ `length` ไม่ใช่ `lenght`

---

## Optional: Return Chocolate Name Too

ถ้าโจทย์ถามให้ return ชื่อ chocolate ที่ score สูงสุดด้วย สามารถเขียนแบบนี้:

```ts
type BestChocolateResult = {
  name: string;
  score: number;
};

async function getBestChocolate(
  multiplier: number[],
  chocolateType: string
): Promise<BestChocolateResult | null> {
  const baseUrl = "https://jsonmock.hackerrank.com/chocolatestype";

  let best: BestChocolateResult | null = null;
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages) {
    const response = await fetch(`${baseUrl}?page=${currentPage}`);
    const json: ApiResponse = await response.json();

    totalPages = json.total_pages;

    for (const chocolate of json.data) {
      if (chocolate.type !== chocolateType) {
        continue;
      }

      const score =
        (
          multiplier[0] * chocolate.ingredients.length -
          multiplier[1] * chocolate.someData.length
        ) / chocolate.nutritionInformation.sugar.amount;

      if (!best || score > best.score) {
        best = {
          name: chocolate.name,
          score
        };
      }
    }

    currentPage++;
  }

  return best;
}
```

---

## Final Answer Pattern

เวลาทำใน HackerRank ให้จำ pattern นี้:

```text
fetch page 1
อ่าน total_pages
loop ทุก page
filter ตาม type
คำนวณ score
เก็บ max score
return max score
```
