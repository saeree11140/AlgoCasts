// --- Directions
// แฮช url ด้วย hashString และขนาดบล็อก k ตามขั้นตอนนี้
// 1. แบ่ง url เป็นบล็อกละ k ตัวจากซ้ายไปขวา บล็อกสุดท้ายสั้นกว่า k ได้
//    เช่น url = "https://xyz.com", k = 4 ได้ ["http", "s://", "xyz.", "com"]
// 2. ค่าของตัวอักษร 'a'..'z' คือ 0..25 ส่วน ':' '/' '.' คือ 26, 27, 28
// 3. hash ของบล็อก = ผลรวมค่าของทุกตัวในบล็อก เช่น "s://" = 19 + 26 + 27 + 27 = 98
// 4. แทนแต่ละบล็อกด้วยตัวอักษรตำแหน่ง (hash % m) ของ hashString (m = ความยาว hashString)
// คืน string ที่ได้จากการต่อตัวอักษรของทุกบล็อก
// url มีเฉพาะ a-z, ':', '/', '.' และ k >= 1
// ที่มาโจทย์: FastPrep — TikTok OA "URL Hashing"
// https://www.fastprep.io/problems/tiktok-url-hashing
// --- Examples
//   hashUrl("https://xyz.com", "pqrst", 4) --> "psps"
//   (hash ของแต่ละบล็อกคือ 60, 98, 100, 28 → mod 5 ได้ 0, 3, 0, 3)

function hashUrl(url: string, hashString: string, k: number): string {
  const value = (ch: string): number => {
    if (ch === ':') return 26;
    if (ch === '/') return 27;
    if (ch === '.') return 28;
    return ch.charCodeAt(0) - 97;
  };

  let result = '';
  for (let start = 0; start < url.length; start += k) {
    let sum = 0;
    for (let i = start; i < Math.min(start + k, url.length); i++) {
      sum += value(url[i]);
    }
    result += hashString[sum % hashString.length];
  }

  return result;
}

export = hashUrl;
