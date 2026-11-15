# AlgoCasts Practice Studio

เว็บ Vite + TypeScript แยกจากโค้ดฝึกเดิม ใช้ดีไซน์จาก `competency/Database Design/database-design-review.html` รวมแบบฝึกหัด เฉลย คู่มือภาพ และเตรียมสอบ Developer

## เปิดใช้งานในเครื่อง

ใช้ Node.js 22.12+ (แนะนำ Node 24 LTS) และ pnpm 11 (`corepack enable` จะใช้เวอร์ชันตาม `packageManager` ใน `package.json`) ติดตั้ง dependency ของเว็บแยกจาก root:

```sh
cd web
pnpm install
pnpm dev
```

เปิด http://127.0.0.1:5173 หรือใช้ `pnpm build` แล้ว `pnpm preview` เพื่อดู production build ที่ http://127.0.0.1:4173

```sh
pnpm test       # content integrity + runner tests with real reference solutions
pnpm run check  # tests + TypeScript check + production build
```

## สิ่งที่มี

- หน้าหลัก ความคืบหน้า ฝึกต่อจากโจทย์ล่าสุด
- 34 ข้อฝึก: AlgoCasts 27 หมวด, Chocolate Report และ Coding Practice 6 ข้อ
- ค้นหา กรองระดับ/หมวด/สถานะ บันทึกโจทย์ไว้
- CodeMirror editor, TypeScript syntax, auto-save, reset, คำใบ้, เฉลย, ชุดทดสอบ และประวัติส่งคำตอบ
- รันทดสอบ 3 เคสแรก หรือส่งคำตอบตรวจทุกเคส; ผ่านทุกเคสจึงนับว่าสำเร็จ
- คู่มือภาพ 115 หน้าแปลงจาก draw.io และเอกสาร Coding Practice
- เตรียมสอบ 14 ทักษะ แสดง HTML ต้นฉบับพร้อมแบบทดสอบที่กดทำได้ และ JavaScript PDF
- Coding Skill: Beginner–Advance, DSA ด้วย JavaScript และ Coding Lab รันเทสต์ในเบราว์เซอร์
- ธีมสว่าง/มืด หน้าจอมือถือ ส่งออก/นำเข้าความคืบหน้า JSON

## โครงสร้างและการเพิ่มเนื้อหา

```text
web/
  scripts/prepare-content.mjs  อ่าน sibling folders และสร้าง static content
  scripts/catalog.mjs          ชื่อหมวด คำอธิบาย คำใบ้ Complexity
  scripts/practice.mjs         6 ข้อฝึกเพิ่ม และตัวอย่างเฉลย Chocolate Report
  scripts/render-diagram.mjs  แปลงภาพ SVG พร้อมตัดบรรทัดและคำนวณขอบเขต
  src/main.ts                 หน้าจอและ navigation
  src/ui-refinements.css      ตัวอักษร ปุ่ม และ responsive layout หลัง UI review
  src/diagram-viewer.ts       เปิดภาพแบบขยาย พร้อมซูมและดาวน์โหลด
  src/editor.ts               CodeMirror
  src/runtime.js              runner รองรับ API เทสต์ที่ใช้จริงใน repo
  src/runner.ts               TypeScript transpilation + sandbox bridge
  src/storage.ts              local progress และ validation ของ backup
  public/sandbox.html         opaque iframe + disposable Worker
  public/content/             generated; ไม่ต้องแก้เอง ไม่ commit
  deploy/                     Nginx/Caddy configuration
```

Build จะอ่าน `../exercises`, `../completed_exercises`, `../chocolatestype`, `../competency` และ `../diagrams` ใหม่ทุกครั้ง โดยไม่แก้ต้นฉบับ ถ้าเพิ่มโจทย์ AlgoCasts ให้เพิ่ม metadata ใน `scripts/catalog.mjs` และมี `completed_exercises/<id>/index.ts` กับ `test.ts` พร้อมกัน Starter สร้างด้วย AST ตัด body และ alternative solution comments ออก Helper modules ใช้เวอร์ชันที่เสร็จแล้ว

ภาพ SVG ใช้ renderer ภายใน อ่าน geometry/text จาก draw.io พร้อมจัดสี ตัดบรรทัด และรวมขอบเขตเส้นเชื่อม ภาพเปิดขยายและซูมในเว็บได้; รูปทรงพื้นฐานและเส้นเชื่อมแสดงได้ แต่ style/route ซับซ้อนอาจต่างจากต้นฉบับ XML ยังอยู่ใน repo สำหรับแก้หรือ export แบบละเอียดภายหลัง

## ขอบเขตตัวรัน

คำตอบ transpile เป็น JavaScript แล้วรันใน Worker ภายใน sandbox iframe ที่ไม่มีสิทธิ์ origin ของแอป บล็อก network ด้วย CSP และมีเวลา 8 วินาที พร้อมจำกัดขนาด code/output ไม่มีการส่งคำตอบไปรันบน VPS จึงใช้ static hosting ได้

Chocolate Report ใช้ in-memory API fixture ที่เข้ากับ 16 เคสเดิม (pagination/filter/retry/error) ไม่เรียก API จริง Helper นี้รองรับเฉพาะ contract ที่โจทย์ต้องการ ไม่ใช่ REST API เต็มชุด ถ้าต้องการทดลอง REST API จริงให้รัน `npm run api` ใน `../chocolatestype` แยกต่างหาก

การตรวจบนเว็บตรวจพฤติกรรม JavaScript และ syntax ไม่ใช่ TypeScript typecheck เต็มรูปแบบ ไม่มี hidden tests หรือระบบป้องกันแก้คะแนน ทุกเทสต์และเฉลยเป็นข้อมูลเปิดสำหรับเรียนรู้ จึงไม่เหมาะใช้ตัดสินคะแนนสอบทางการ สถานะผ่านบันทึกว่าเคยผ่าน และไม่ถูกลบเมื่อแก้โค้ดใหม่ภายหลัง

ความคืบหน้าเป็น localStorage ของ browser/origin นี้ ไม่มีบัญชีผู้ใช้และไม่ sync ระหว่างเครื่อง การเปลี่ยน hostname, ล้าง browser หรือเปลี่ยนเครื่องต้อง export/import ก่อน การ deploy ไม่ต้องสำรอง DB ของผู้เรียนที่ VPS

## Deploy VPS ด้วย Docker

ต้องมี Git, Docker Engine และ Compose plugin บน VPS โคลน **ทั้ง repository** เพราะเป็น build context ไม่ใช่คัดลอกเฉพาะ `web/` Docker build ติดตั้ง dependency เว็บให้เอง ไม่ต้อง `npm ci` ที่ root

```sh
cd AlgoCasts
cp web/deploy/dockerignore.example .dockerignore
cd web
cp .env.example .env
# แก้ PORT / DOMAIN / ACME_EMAIL ตามที่ใช้

docker compose up -d --build
docker compose ps
curl -f http://127.0.0.1:8080/healthz
```

ค่าเริ่มต้นเปิดเฉพาะ `127.0.0.1:8080` สำหรับให้ reverse proxy บน VPS ส่งต่อมา รองรับ root domain/subdomain; แอปใช้ absolute `/content` และ `/sandbox.html` จึงไม่รองรับติดตั้งใต้ subpath

### มีโดเมนและต้องการ HTTPS อัตโนมัติ

ตั้ง DNS A (และ AAAA ถ้าใช้ IPv6) ให้ชี้ VPS แก้ `DOMAIN` และ `ACME_EMAIL` ใน `.env` เปิด TCP 80/443 และ UDP 443 ถ้าต้องการ HTTP/3 ต้องไม่มีบริการอื่นจับ port 80/443

```sh
docker compose -f compose.yml -f compose.https.yml up -d --build
docker compose -f compose.yml -f compose.https.yml logs --tail=50 caddy
```

Caddy ขอ certificate และต่ออายุให้เอง เก็บ certificate ใน volumes `caddy_data` / `caddy_config` อย่าลบ volumes เหล่านี้ระหว่าง update หากมี Nginx/Caddy บนเครื่องอยู่แล้ว ให้ใช้ compose ปกติและตั้ง reverse proxy ไป `http://127.0.0.1:8080` พร้อม HTTPS ที่ proxy เดิม อย่าบังคับ CSP จาก proxy ที่บล็อก `sandbox.html` หรือแบบทดสอบ inline ของเอกสาร; policy แยกตาม path อยู่ใน `deploy/nginx.conf`

### Update และ rollback

ก่อน update เก็บ image ปัจจุบันไว้:

```sh
docker image tag algocasts-web:local algocasts-web:previous
git pull --ff-only
docker compose up -d --build
curl -f http://127.0.0.1:8080/healthz
```

ถ้าใช้ HTTPS ให้ใช้ `-f compose.yml -f compose.https.yml` กับคำสั่ง compose ทุกครั้ง Rollback image:

```sh
docker image tag algocasts-web:previous algocasts-web:local
docker compose up -d --no-build --force-recreate web
```

container ใช้ unprivileged Nginx, read-only filesystem, tmpfs, health check, log rotation และจำกัด memory 128 MB ส่วนขั้น build ควรมี RAM ประมาณ 1 GB ขึ้นไป runtime เสิร์ฟไฟล์ static โดยไม่ใช้ Node

### Deploy โดยไม่ใช้ Docker

ที่เครื่อง build รัน `pnpm install --frozen-lockfile && pnpm run check` ใน `web/` แล้วส่ง `web/dist/` ทั้งชุดไป document root ของ Nginx บน VPS ใช้ `deploy/nginx.conf` เป็นฐาน ปรับ `listen`/`root` ให้ตรงเครื่องจริง และตั้ง HTTPS ที่ reverse proxy อย่าใช้ Vite dev/preview server เป็น production server

## การอ้างอิง

- สไตล์และบทเรียน: source ใน repo นี้
- [Vite guide](https://vite.dev/guide/) และ [production build](https://vite.dev/guide/build)
- [CodeMirror documentation](https://codemirror.net/docs/)
- [MDN: iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox)

ตรวจสิทธิ์การนำเนื้อหาต้นทางไปเผยแพร่ตาม LICENSE ของ repo และเอกสารแต่ละชุดก่อนเผยแพร่สู่สาธารณะ

## Layout หน้าเขียนโค้ด

หน้าเขียนโค้ดใช้พื้นที่ที่เหลือใต้เมนูแบบเต็มหน้าต่างบน desktop (viewport กว้างอย่างน้อย 980px และสูงอย่างน้อย 650px) ส่วนจอเล็กหรือหน้าต่างเตี้ยเลื่อนทั้งหน้าได้ตามปกติ ปุ่มรันและผลทดสอบต้องเข้าถึงได้เสมอ วิธีเปิด browser ส่งต่อให้ผู้ใช้สำหรับ agent อยู่ใน [AGENTS.md](AGENTS.md)
