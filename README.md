# AlgoCasts

repo ประกอบคอร์ส [The Coding Inteview Bootcamp: Algorithms + Data Structures](https://www.udemy.com/course/coding-interview-bootcamp-algorithms-and-data-structure/)

โค้ดแบบฝึกหัดและเทสต์ทั้งหมดเขียนด้วย TypeScript ต้องใช้ Node.js 22 ขึ้นไป

```sh
npm ci
npm run typecheck
npm test
```

`npm test` จะ build ทั้งสองโฟลเดอร์แล้วรันเฉลยที่ทำเสร็จแล้ว ได้ 27 suite รวม 139 เทสต์
ส่วน `npm run build` จะสร้าง JavaScript แบบ CommonJS, ไฟล์ declaration และ source map
ลงใน `dist/` ซึ่งถูก ignore ไว้ ให้แก้ไฟล์ `.ts` อย่าแก้ไฟล์ที่ build สร้างขึ้น

`exercises/` เก็บโจทย์ฝึกที่จงใจเว้นไว้ให้ทำเอง รัน `npm run test:exercises` เพื่อเทสต์คำตอบ
หรือ `npm run test:all` เพื่อเทสต์ทั้งสองโฟลเดอร์ ถ้ายังไม่แก้โค้ดตั้งต้นเลย จะผ่าน 32 เทสต์
ไม่ผ่าน 78 และข้าม 30 คำสั่งเหล่านี้จึงจบด้วยสถานะล้มเหลวจนกว่าจะทำแบบฝึกหัดเสร็จ
เทสต์ linked list ที่ถูกข้ามมาตั้งแต่ต้นฉบับยังถูกข้ามเหมือนเดิม

กรองเทสต์ตามโฟลเดอร์แบบฝึกหัด:

```sh
npm test -- linkedlist
npm run test:exercises -- reversestring
```

หลังติดตั้ง dependency ที่ root ของ repo แล้ว จะเข้าไปรัน `npm test -- linkedlist` ในโฟลเดอร์แบบฝึกหัด
ของฝั่งไหนก็ได้ ทั้งสองโฟลเดอร์ใช้ compiler และ dependency สำหรับเทสต์ชุดเดียวกันที่ root

class ตั้งต้นใช้ member แบบ `declare` เพื่อบอกหน้าตา API ที่ต้องการ โดยไม่มีโค้ดทำงานจริงตอน runtime
เวลาทำแบบฝึกหัดให้เปลี่ยน declaration เหล่านี้เป็น method ฟังก์ชันที่ยังไม่เสร็จจะคืน `undefined`
ให้เขียนเนื้อฟังก์ชันและปรับ return type ไประหว่างทำ non-null assertion ในเทสต์บอกว่าค่านั้นต้องมี
ตามที่ setup เตรียมไว้ และไม่ได้เปลี่ยน assertion ที่รันตอน runtime

ตัวอย่าง browser event ใช้ [jQuery 4.0.0 slim](https://blog.jquery.com/2026/01/17/jquery-4-0-0/)
จาก CDN ทางการพร้อม Subresource Integrity เปิดไฟล์ `events/example.html` ฝั่งไหนก็ได้ในเบราว์เซอร์รุ่นใหม่
ได้โดยตรง ตัวอย่างที่เสร็จแล้วจะ log `Hello` และ `There!` อย่างละครั้ง แล้วถอด click handler ทั้งสองตัวออก
ส่วนตัวอย่างตั้งต้นยังว่างอยู่

ผลการตรวจหลังย้ายมาใช้ TypeScript และปัญหาจาก dependency audit ที่รู้อยู่แล้ว บันทึกไว้ใน
[รายงานการตรวจสอบ](docs/typescript-migration-verification.md)
