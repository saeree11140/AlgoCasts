# Chocolate Types: โจทย์ฟังก์ชันเดียวบน Mock API

โฟลเดอร์นี้มี mock REST API ของ "ประเภทช็อกโกแลต" (`api/`) และโจทย์แบบ LeetCode หนึ่งข้อ (`client/`)

## Problem Statement (โจทย์)

**Chocolate Report** · ระดับปานกลาง

ร้านช็อกโกแลต **Cocoa Lab** อยากได้รายงานสรุปช็อกโกแลตที่เข้มข้นตั้งแต่ระดับที่กำหนดขึ้นไป แยกตาม category

ให้เขียนฟังก์ชันใน [client/index.ts](./client/index.ts)

```ts
chocolateReport(baseUrl: string, minCacao: number): Promise<ChocolateReport>
```

ดึงรายการทั้งหมดที่ `cacaoPercent >= minCacao` จาก `GET {baseUrl}/api/chocolate-types` แล้วคืน object ที่มี key เป็น category และ value เป็น

- `count`: จำนวนรายการใน category นั้น
- `avgCacao`: ค่าเฉลี่ยของ `cacaoPercent` ปัดเป็นทศนิยม 2 ตำแหน่ง (เช่น `70.666…` เป็น `70.67`)
- `strongest`: `name` ของรายการที่ `cacaoPercent` สูงสุด ถ้าเท่ากันให้เลือกรายการที่ `id` น้อยที่สุด

category ที่ไม่มีรายการเลยต้องไม่มี key ใน object ถ้าไม่มีรายการเลยให้คืน `{}`

### Example 1

```
Input:  minCacao = 0   (ข้อมูลเริ่มต้นของ API)
Output: {
  dark:  { count: 2, avgCacao: 85, strongest: "Dark 100 Pure" },
  milk:  { count: 1, avgCacao: 35, strongest: "Milk Classic" },
  white: { count: 1, avgCacao: 0,  strongest: "White Vanilla" },
  ruby:  { count: 1, avgCacao: 47, strongest: "Ruby Berry" }
}
```

### Example 2

```
Input:  minCacao = 50
Output: { dark: { count: 2, avgCacao: 85, strongest: "Dark 100 Pure" } }
Explanation: มีแค่ Dark 70 กับ Dark 100 Pure ที่ cacaoPercent >= 50 ค่าเฉลี่ยคือ (70 + 100) / 2 = 85
```

### Example 3

```
Input:  minCacao = 11   (API มีแค่ { name: "Low", category: "milk", cacaoPercent: 10 })
Output: {}
```

### Constraints

- `0 <= minCacao <= 100` เป็นจำนวนเต็ม (minCacao ที่ไม่ถูกต้องจะทำให้ API ตอบ 400)
- API มีได้ 0 ถึง 1,000 รายการ และคืนได้หน้าละไม่เกิน 50 รายการ (`pageSize <= 50`)
- **จำนวน request ต้องน้อยที่สุด**: กรองด้วย query `minCacao` ที่ฝั่ง API, ใช้ `pageSize=50` และหยุดเมื่อถึงหน้าสุดท้ายตาม `meta.totalPages` โดยไม่ขอหน้าว่างเพิ่ม
- API อาจตอบ `503` ชั่วคราวได้ทุก request ให้ลองซ้ำ request เดิมได้ไม่เกิน **3 ครั้งต่อ request** (รวมไม่เกิน 4 ครั้ง) ไม่ต้องรอ (`Retry-After` เป็น `0`)
- ถ้ายังได้ 503 หลังครบ 3 ครั้ง หรือได้ status อื่นที่ไม่ใช่ 2xx ให้ throw `Error` ที่ข้อความมีเลข status เช่น `Request failed with status 503` และ status อื่นที่ไม่ใช่ 503 ห้าม retry
- ใช้ global `fetch` เท่านั้น ห้าม hardcode URL และห้ามแก้ไฟล์ใน `api/` และ `client/test.ts`

### Hint

response ของ API มีหน้าตา `{ "data": [...], "meta": { "page", "pageSize", "total", "totalPages" } }` และรายการเรียงตาม `id` จากน้อยไปมากอยู่แล้ว

## Mock API Reference

เมื่อรัน `npm run api` จะเปิดที่ `http://127.0.0.1:3000/api/chocolate-types` (เปลี่ยนพอร์ตด้วย `PORT=...` ต้องเป็นจำนวนเต็ม 0 ถึง 65535) ส่วนเทสต์ของโจทย์จะเปิด API บนพอร์ตสุ่มให้เองทุกเคส ด้วย `startChocolateApi({ seed, failListRequests })` เพื่อกำหนดข้อมูลเริ่มต้นและเลือกว่า request ลำดับที่เท่าไรของ `GET /api/chocolate-types` จะได้ 503

### ข้อมูล (ChocolateType)

| ฟิลด์ | ชนิด | กติกา |
|---|---|---|
| `id` | number | จำนวนเต็มบวก server กำหนดให้ เพิ่มขึ้นเรื่อย ๆ และไม่นำ id ของรายการที่ลบแล้วกลับมาใช้ |
| `name` | string | ตัดช่องว่างหัวท้ายแล้วต้องไม่ว่าง ยาวไม่เกิน 50 ตัวอักษร และไม่ซ้ำ (เทียบโดยไม่สนตัวพิมพ์เล็กใหญ่) |
| `category` | string | `dark`, `milk`, `white` หรือ `ruby` |
| `cacaoPercent` | number | จำนวนเต็ม 0 ถึง 100 |
| `sugarFree` | boolean | ค่าเริ่มต้นคือ `false` |

ข้อมูลเริ่มต้นมี 5 รายการ: `Dark 70` (id 1), `Milk Classic` (2), `White Vanilla` (3), `Ruby Berry` (4), `Dark 100 Pure` (5)

### Endpoints

| Method | Path | ความหมาย | status ที่เป็นไปได้ |
|---|---|---|---|
| GET | `/api/chocolate-types` | รายการพร้อม filter, sort, pagination | 200, 400 |
| GET | `/api/chocolate-types/:id` | ดึงรายการเดียว | 200, 400, 404 |
| POST | `/api/chocolate-types` | สร้างรายการ | 201, 400, 409, 415 |
| PATCH | `/api/chocolate-types/:id` | แก้ไขบางฟิลด์ | 200, 400, 404, 409, 415 |
| DELETE | `/api/chocolate-types/:id` | ลบรายการ | 204, 400, 404 |

query ของ `GET /api/chocolate-types` (`simulate` และ `delay` ใช้ได้กับ endpoint นี้เท่านั้น):
- `category`: `dark`, `milk`, `white` หรือ `ruby`
- `minCacao`: 0 ถึง 100 (รวมค่าขอบ)
- `sort`: `id` (ค่าเริ่มต้น), `name`, `-name`, `cacaoPercent`, `-cacaoPercent` การเรียงชื่อไม่สนตัวพิมพ์ และถ้าค่าเท่ากันจะเรียงตาม `id` จากน้อยไปมาก
- `page` (ค่าเริ่มต้น 1), `pageSize` (1 ถึง 50, ค่าเริ่มต้น 10)
- `delay` (0 ถึง 5000 ms): รอก่อนตอบ
- `simulate`:
  - `500`: ตอบ 500 เสมอ
  - `503`: ตอบ 503 เสมอ พร้อม `Retry-After: 1`
  - `429`: ตอบ 429 เสมอ พร้อม `Retry-After: 1`
  - `flaky`: ตอบ 503 สองครั้งแรกของการเปิด API แล้วตอบปกติหลังจากนั้น

response ของ list คือ `{ "data": [...], "meta": { "page", "pageSize", "total", "totalPages" } }` ถ้า `page` เกินจำนวนหน้า จะได้ `data: []` และสถานะ 200

การตรวจ request ของ PATCH เรียงตามนี้: id (400 `INVALID_ID`), Content-Type (415), JSON (400), ค่าใน body (400), การมีอยู่ของ id (404), ชื่อซ้ำ (409) ส่วน POST เรียง Content-Type (415), JSON (400), ค่าใน body (400), ชื่อซ้ำ (409) ฟิลด์ `id` ที่ส่งมาจะถูกละเว้น และ PATCH ต้องมีอย่างน้อยหนึ่งฟิลด์จาก `name`, `category`, `cacaoPercent`, `sugarFree`

### รูปแบบ error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body is invalid",
    "details": [{ "field": "name", "message": "must not be blank" }]
  }
}
```

`details` จะมีเฉพาะ error ที่ระบุ field หรือ query ได้

| code | status | เกิดเมื่อ |
|---|---|---|
| `INVALID_QUERY` | 400 | query parameter ไม่ถูกต้อง |
| `INVALID_ID` | 400 | id ไม่ใช่จำนวนเต็มบวก |
| `INVALID_JSON` | 400 | body ไม่ใช่ JSON (รวมถึง body ว่าง) |
| `VALIDATION_ERROR` | 400 | ค่าใน body ไม่ผ่านกติกา (รวมถึง body ที่ไม่ใช่ object และ PATCH ที่ไม่มีฟิลด์ที่แก้ได้) |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | POST หรือ PATCH ไม่ได้ส่ง `Content-Type: application/json` |
| `NOT_FOUND` | 404 | ไม่พบ chocolate type ที่ id นั้น |
| `ROUTE_NOT_FOUND` | 404 | path ไม่มีในระบบ (รวมถึง path ที่มี `/` ต่อท้าย) |
| `METHOD_NOT_ALLOWED` | 405 | method ไม่รองรับ (response มี header `Allow`) |
| `DUPLICATE_NAME` | 409 | ชื่อซ้ำกับรายการอื่น |
| `PAYLOAD_TOO_LARGE` | 413 | body ใหญ่เกิน 1 MB (ตรวจก่อนทุกอย่าง) |
| `RATE_LIMITED` | 429 | จาก `simulate=429` |
| `INTERNAL_ERROR` | 500 | จาก `simulate=500` |
| `SERVICE_UNAVAILABLE` | 503 | จาก `simulate=503`, `simulate=flaky` หรือ `failListRequests` ตอนเทสต์ |

## วิธีรัน

สคริปต์ใช้ TypeScript compiler จาก `node_modules` ที่ root ของ repo จึงต้องรัน `npm ci` ที่ root ก่อน (เหมือนแบบฝึกอื่นในรีโพ) แล้วเข้ามาในโฟลเดอร์นี้:

```sh
cd chocolatestype

npm test              # เทสต์ของ mock API (ผ่านทั้งหมด)
npm run test:client   # เทสต์โจทย์ chocolateReport (16 เคส)
npm run api           # เปิด mock API ที่ http://127.0.0.1:3000
```

## โครงสร้างโฟลเดอร์

```
chocolatestype/
├── README.md        โจทย์และเอกสาร API
├── api/             mock API (index.ts, store.ts, validation.ts, main.ts) และ test.ts
├── client/          index.ts ที่ต้องเขียน chocolateReport และ test.ts (เทสต์โจทย์)
├── package.json
└── tsconfig.json
```
