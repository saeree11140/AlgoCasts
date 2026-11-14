# Coding Practice #01 — คู่มือ 6 โจทย์พร้อมวิธีคิด (JavaScript)

> เอกสารฝึก Coding Test จากรายชื่อโจทย์ในภาพที่ผู้เรียนส่งมา: Insert at Beginning Linked List, Two Sum, Group Anagrams, Search Insert Position, Binary Search และ Top K Frequent Elements  
> **ข้อควรทราบ:** ภาพแสดงชื่อและระดับความยาก แต่ไม่ได้แสดงคำอธิบายโจทย์, constraints หรือ function signature ที่ระบบตรวจใช้ คู่มือนี้จึงใช้รูปแบบโจทย์มาตรฐานที่รู้จักกันทั่วไป หากโจทย์จริงกำหนดชื่อ function หรือรูปแบบ Node ต่างออกไป ให้ปรับเฉพาะส่วนรับ–ส่งข้อมูล

## เตรียมตัวก่อนเริ่ม

| ข้อ | โจทย์ | ระดับในภาพ | Pattern ที่ใช้ | Complexity ของคำตอบตัวอย่าง |
|---|---|---|---|---|
| 1 | Insert at Beginning Linked List | Easy | Linked List / Pointer | O(1) time, O(1) extra space |
| 2 | Two Sum | Easy | Hash Map | O(n) time, O(n) space |
| 3 | Group Anagrams | Medium | Hash Map + Sorting | O(n · k log k) time, O(nk) space |
| 4 | Search Insert Position | Easy | Binary Search / Lower Bound | O(log n) time, O(1) space |
| 5 | Binary Search | Easy | Binary Search | O(log n) time, O(1) space |
| 6 | Top K Frequent Elements | Medium | Frequency Map + Bucket Sort | O(n) time, O(n) space |

ตัวแปร `n` คือจำนวนสมาชิกใน Array และ `k` ใน Group Anagrams คือความยาวของคำ (ไม่ใช่จำนวนคำที่ต้องคืนจาก Top K)

### วิธีอ่านแต่ละข้อ

อ่านโจทย์และตัวอย่างก่อน จากนั้นลองคิดวิธีแก้ด้วยตัวเองอย่างน้อย 10–15 นาที เมื่อทำไม่ได้ให้ดู **วิธีคิด** ก่อน ไม่จำเป็นต้องเปิดโค้ดเฉลยทันที สุดท้ายลองอธิบายว่าโค้ดผ่านกรณี Array ว่าง, ข้อมูลซ้ำ, target ไม่พบ หรือข้อมูลเรียงอยู่แล้วได้อย่างไร

---

# 1. Insert at Beginning Linked List — Easy

## โจทย์

มี Singly Linked List และตัวเลขใหม่ `data` ให้เพิ่ม Node ที่ **หัวรายการ (head)** แล้วคืนค่า head ใหม่

ตัวอย่าง:

```text
Input:  head = 10 -> 20 -> 30 -> null, data = 5
Output: 5 -> 10 -> 20 -> 30 -> null
```

## ทำความเข้าใจ Linked List ก่อน

Array เก็บสมาชิกตาม index แต่ Singly Linked List เก็บเป็น Node ที่มี 2 ส่วน คือ `data` (ข้อมูลใน Node) และ `next` (ตัวชี้ไป Node ถัดไป) ตัวแปร `head` คือ Node แรกของรายการ

```text
head
 ↓
[10 | next] → [20 | next] → [30 | null]
```

การเพิ่มหัวรายการไม่จำเป็นต้องเลื่อนข้อมูลทั้งหมดเหมือน Array เพราะแค่สร้าง Node ใหม่แล้วชี้ `next` ไปยัง head เดิม

## วิธีคิดทีละขั้น

1. สร้าง Node ใหม่เก็บ `data` ที่ต้องการเพิ่ม
2. ให้ `newNode.next = head` เพื่อเชื่อม Node ใหม่เข้ากับรายการเดิม
3. คืน `newNode` ให้เป็น head ใหม่

## โค้ด JavaScript

```js
function insertAtHead(head, data) {
  const newNode = { data, next: head };
  return newNode;
}

// ถ้าโจทย์กำหนด class SinglyLinkedListNode มาให้ ใช้ class นั้นแทน object ได้
```

## ไล่การทำงาน

```text
ก่อน: head → 10 → 20 → 30 → null
สร้าง: newNode = [5 | ?]
เชื่อม: newNode.next = head
หลัง: newNode → 5 → 10 → 20 → 30 → null
```

**กรณีว่าง:** ถ้า `head = null`, Node ใหม่จะมี `next = null` โดยอัตโนมัติ จึงถูกต้องอยู่แล้ว

**Complexity:** O(1) time เพราะไม่ได้วน List และ O(1) extra space เพราะสร้าง Node ใหม่เพียง 1 ตัว

**จุดที่มักผิด:** เขียน `head.next = newNode` จะกลายเป็นการเปลี่ยนลิงก์ของ Node เดิม และอาจทำข้อมูลส่วนที่เหลือหาย ไม่ได้เพิ่มที่ต้นรายการ

**โจทย์ท้ายบท:** ถ้า head เป็น `null` และเพิ่มเลข 7 จะได้ผลลัพธ์อย่างไร?  
**เฉลย:** `7 -> null`

---

# 2. Two Sum — Easy

## โจทย์

ได้รับ Array `nums` และจำนวน `target` ให้คืน index ของตัวเลข **สองตำแหน่งที่ต่างกัน** ซึ่งบวกกันได้ `target`

```text
Input:  nums = [2, 7, 11, 15], target = 9
Output: [0, 1]   // nums[0] + nums[1] = 2 + 7 = 9
```

## วิธีแรก: Brute Force

ลองสมาชิกทุกคู่ เช่น `2+7`, `2+11`, `2+15`, ... จนพบคำตอบ ใช้ loop ซ้อนกัน ทำให้ O(n²)

## วิธีที่เหมาะกว่า: Hash Map

เมื่อดูเลข `num` ให้ถามว่า **ต้องการเลขอะไรอีกตัวหนึ่งจึงจะรวมกันได้ target?** ค่าที่ต้องการคือ `target - num` จากนั้นใช้ `Map` เช็กว่าเราเคยพบเลขนั้นมาก่อนหรือไม่

ตัวอย่าง: `target=9` เมื่อเจอ `7` ต้องการ `2` ซึ่งเคยเก็บไว้ใน Map แล้ว จึงตอบ `[0,1]` ได้ทันที

## โค้ด JavaScript

```js
function twoSum(nums, target) {
  const seen = new Map(); // key = ตัวเลข, value = index ที่เคยพบ

  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];

    if (seen.has(need)) {
      return [seen.get(need), i];
    }

    seen.set(nums[i], i);
  }

  return []; // ใช้กรณีไม่มีคำตอบ; บาง platform รับประกันว่ามีคำตอบเสมอ
}
```

## Dry Run

| รอบ | `i` | `nums[i]` | `need` | Map ก่อนตรวจ | ผล |
|---|---:|---:|---:|---|---|
| 1 | 0 | 2 | 7 | `{}` | ไม่พบ 7 → เก็บ 2:0 |
| 2 | 1 | 7 | 2 | `{2: 0}` | พบ 2 → คืน `[0,1]` |

**ทำไมต้อง `has` ก่อน `set`?** เพราะห้ามใช้ index เดียวกันสองครั้ง เช่น `[3,3]` กับ target 6 ต้องรอเจอ 3 ตัวที่สองก่อนค่อยตอบ

**Complexity:** O(n) time โดยเฉลี่ยสำหรับการค้นหา Map และ O(n) space เพราะอาจต้องเก็บเลขทุกตัว

**กรณีทดสอบ:**

```text
nums=[3,3], target=6       → [0,1]
nums=[-1,-2,-3], target=-5 → [1,2]
nums=[1,2,3], target=99    → []  (ถ้าโจทย์ยอมให้ไม่มีคำตอบ)
```

---

# 3. Group Anagrams — Medium

## โจทย์

ให้จัดกลุ่มคำที่ใช้ตัวอักษรชุดเดียวกันและจำนวนเท่ากัน ถึงแม้ลำดับตัวอักษรต่างกัน เช่น `eat`, `tea`, `ate` อยู่กลุ่มเดียวกัน

```text
Input:  ["eat", "tea", "tan", "ate", "nat", "bat"]
Output: [["eat","tea","ate"], ["tan","nat"], ["bat"]]
```

หมายเหตุ: ลำดับของกลุ่มและสมาชิกแต่ละกลุ่มอาจต่างกันได้ หากระบบตรวจยอมรับผลลัพธ์ทุกลำดับ

## วิธีคิด

ถ้าคำสองคำเป็น Anagram เมื่อนำตัวอักษรมาเรียงลำดับแล้วจะได้คำเดียวกัน

```text
eat → a,e,t → "aet"
tea → a,e,t → "aet"
ate → a,e,t → "aet"
```

ใช้คำที่เรียงแล้วเป็น key ใน Map และเก็บคำต้นฉบับไว้ใน Array ของกลุ่ม

## โค้ด JavaScript

```js
function groupAnagrams(words) {
  const groups = new Map();

  for (const word of words) {
    const key = word.split('').sort().join('');

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(word);
  }

  return [...groups.values()];
}
```

## ไล่ตัวอย่าง

| คำ | key จากการ sort | สถานะกลุ่ม |
|---|---|---|
| `eat` | `aet` | `aet: [eat]` |
| `tea` | `aet` | `aet: [eat, tea]` |
| `tan` | `ant` | `ant: [tan]` |
| `ate` | `aet` | `aet: [eat, tea, ate]` |
| `nat` | `ant` | `ant: [tan, nat]` |
| `bat` | `abt` | `abt: [bat]` |

**Complexity:** ถ้ามี `n` คำ แต่ละคำยาวไม่เกิน `k`, การ sort แต่ละคำใช้ O(k log k) รวมเป็น O(n·k log k), space O(nk) เพื่อเก็บผลลัพธ์และ key โดยประมาณ

**จุดที่มักผิด:** เปรียบเทียบแค่ความยาวคำไม่พอ `abc` กับ `xyz` ยาวเท่ากันแต่ไม่ใช่ Anagram และต้องระวังจำนวนตัวอักษร เช่น `aab` กับ `abb` ไม่อยู่กลุ่มเดียวกัน

**ทางเลือก:** หากโจทย์รับเฉพาะตัวอักษรภาษาอังกฤษ `a-z` สามารถนับความถี่ตัวอักษรทั้ง 26 ตัวเพื่อใช้เป็น key และลดต้นทุนการ sort ได้

---

# 4. Search Insert Position — Easy

## โจทย์

ได้รับ Array ที่เรียงจากน้อยไปมากและ `target` ให้คืน index ของ target หากพบ หรือ **ตำแหน่งที่ควรแทรก** หากไม่พบ โดยต้องรักษาลำดับของ Array

```text
nums=[1,3,5,6], target=5 → 2
nums=[1,3,5,6], target=2 → 1
nums=[1,3,5,6], target=7 → 4
```

## แนวคิด: Binary Search เพื่อหา Lower Bound

ต้องหาตำแหน่งแรกที่มีค่า **มากกว่าหรือเท่ากับ `target`** ไม่จำเป็นต้องค้นให้เจอเสมอ

ใช้ช่วง `[left, right)` โดย `right` เป็นตำแหน่งถัดจากสมาชิกสุดท้าย

## โค้ด JavaScript

```js
function searchInsert(nums, target) {
  let left = 0;
  let right = nums.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}
```

## Dry Run: `nums=[1,3,5,6], target=2`

| รอบ | left | right | mid | nums[mid] | ทำอะไรต่อ |
|---|---:|---:|---:|---:|---|
| 1 | 0 | 4 | 2 | 5 | 5 ≥ 2 → right=2 |
| 2 | 0 | 2 | 1 | 3 | 3 ≥ 2 → right=1 |
| 3 | 0 | 1 | 0 | 1 | 1 < 2 → left=1 |

จบเมื่อ left=right=1 จึงคืน 1

**Complexity:** O(log n) time, O(1) space

**จุดที่มักผิด:** หยุดทันทีเมื่อไม่พบ target แล้วคืน `-1` ซึ่งผิดกับโจทย์นี้ เพราะต้องตอบตำแหน่งแทรก

---

# 5. Binary Search — Easy

## โจทย์

ให้ค้นหา `target` ใน Array ที่เรียงจากน้อยไปมาก ถ้าพบให้คืน index ถ้าไม่พบให้คืน `-1` (รูปแบบมาตรฐานของโจทย์ Binary Search)

```text
nums=[-1,0,3,5,9,12], target=9 → 4
nums=[-1,0,3,5,9,12], target=2 → -1
```

## วิธีคิด

ดูสมาชิกตรงกลางแล้วตัดทิ้งครึ่งที่ไม่มีทางมี target ได้ จึงค้นเร็วกว่า loop ทุกตัว

## โค้ด JavaScript

```js
function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) return mid;

    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}
```

## Dry Run: หา `9`

```text
[-1, 0, 3, 5, 9, 12]
 left=0, right=5 → mid=2 → 3 < 9 → ทิ้งครึ่งซ้าย
 left=3, right=5 → mid=4 → 9 === 9 → คืน 4
```

**Complexity:** O(log n) time, O(1) space

**ต่างจากข้อ 4:** Binary Search คืน `-1` เมื่อไม่พบ ส่วน Search Insert Position คืนตำแหน่งที่จะนำตัวเลขไปแทรก

**จุดที่มักผิด:** Binary Search แบบนี้ต้องรับ Array ที่เรียงลำดับมาแล้ว ถ้าข้อมูลไม่เรียง ผลลัพธ์อาจผิด

---

# 6. Top K Frequent Elements — Medium

## โจทย์

จาก Array `nums` ให้คืนสมาชิกที่มีความถี่สูงที่สุด `k` ตัว (คืนค่าที่ไม่ซ้ำกัน)

```text
nums=[1,1,1,2,2,3], k=2 → [1,2]
nums=[4,4,5,5,5,6], k=1 → [5]
```

## วิธีคิด

แบ่งเป็น 2 ขั้น

1. นับจำนวนการปรากฏของแต่ละเลขด้วย `Map` เช่น `{1:3, 2:2, 3:1}`
2. นำเลขไปใส่ Bucket ตามความถี่ เช่น bucket[3]=[1], bucket[2]=[2], bucket[1]=[3] จากนั้นไล่ bucket จากความถี่มากไปน้อยจนได้ `k` ตัว

## โค้ด JavaScript

```js
function topKFrequent(nums, k) {
  if (k <= 0) return [];

  const frequency = new Map();

  for (const num of nums) {
    frequency.set(num, (frequency.get(num) ?? 0) + 1);
  }

  const buckets = Array.from({ length: nums.length + 1 }, () => []);

  for (const [num, count] of frequency) {
    buckets[count].push(num);
  }

  const result = [];

  for (let count = buckets.length - 1; count >= 1; count--) {
    for (const num of buckets[count]) {
      result.push(num);
      if (result.length === k) return result;
    }
  }

  return result; // กรณี k มากกว่าจำนวนค่าที่แตกต่างกัน จะคืนค่าที่มีทั้งหมด
}
```

## Dry Run: `[1,1,1,2,2,3], k=2`

```text
frequency = {1:3, 2:2, 3:1}
buckets[3] = [1]
buckets[2] = [2]
buckets[1] = [3]
ไล่จาก 3 → 2 → ได้ [1,2] ครบ k=2 → หยุด
```

**Complexity:** O(n) time และ O(n) space สำหรับวิธี Bucket Sort เนื่องจากจำนวนความถี่สูงสุดไม่เกินจำนวนสมาชิก `n`

**เปรียบเทียบ:** วิธีนับความถี่แล้ว Sort ทุกค่าที่แตกต่างกัน ใช้ O(n + u log u) เมื่อ `u` เป็นจำนวนค่าที่ไม่ซ้ำ วิธี Bucket Sort มักเหมาะกับโจทย์นี้มากกว่า หากข้อมูลมีข้อจำกัดให้ใช้ได้

**จุดที่มักผิด:** ต้องคืน `k` **ค่าไม่ซ้ำกัน** ไม่ใช่สมาชิกตัวแรก `k` ตัวของ Array และหากมีความถี่เท่ากัน อาจมีคำตอบได้หลายชุดขึ้นกับข้อกำหนดของโจทย์

---

# ข้อสอบจำลองเพิ่มเติม (ไม่เปิดเฉลยก่อนลองทำ)

### Easy

**E1** เริ่มจาก List `3 → 6 → null` แล้วเรียก `insertAtHead(head, 1)` สองครั้ง ผลลัพธ์คืออะไร?

**E2** `twoSum([1, 5, 3, 7], 10)` ควรคืน index ใด?

**E3** `searchInsert([1, 3, 3, 8], 3)` คืน index ใด หากใช้แนวคิด Lower Bound?

**E4** `binarySearch([1, 3, 5, 7, 9], 2)` คืนอะไร?

### Medium

**M1** `groupAnagrams(['abc','bca','cab','ab','ba','x'])` มีกี่กลุ่ม?

**M2** `topKFrequent([5,5,5,6,6,7,7,7,7,8], 2)` คืนค่าใด?

**M3** เมื่อใดควรใช้ `Map` แทน nested loops ในโจทย์ค้นหาคู่ตัวเลข? อธิบาย Trade-off ด้าน Memory

**M4** Binary Search แบบ `left <= right` และ Lower Bound แบบ `left < right` ต่างกันอย่างไรเรื่องความหมายของ `right`?

## เฉลยแบบฝึกเพิ่มเติม

**E1:** `1 → 1 → 3 → 6 → null` เพราะแต่ละครั้งสร้าง Node ใหม่ที่หัว List และไม่ได้ลบตัวเดิม

**E2:** `[2,3]` เพราะ 3 + 7 = 10

**E3:** `1` เพราะ Lower Bound คือ index แรกที่มีค่ามากกว่าหรือเท่ากับ 3

**E4:** `-1` เพราะเลข 2 ไม่อยู่ใน Array

**M1:** 3 กลุ่ม ได้แก่ `[abc,bca,cab]`, `[ab,ba]`, `[x]`

**M2:** `[7,5]` เพราะ 7 ปรากฏ 4 ครั้ง และ 5 ปรากฏ 3 ครั้ง

**M3:** ใช้ `Map` เมื่ออยากค้นหาค่าที่เคยเจออย่างรวดเร็ว โดยยอมใช้พื้นที่เพิ่ม O(n) เพื่อลดเวลาจาก O(n²) เป็น O(n) โดยเฉลี่ย

**M4:** ใน Binary Search ตัวอย่างใช้ช่วงปิด `[left,right]` โดย `right = n - 1` ส่วน Lower Bound ใช้ช่วงครึ่งเปิด `[left,right)` โดย `right = n` และคืนตำแหน่งแทรกเมื่อช่วงค้นหาหมด

---

# เตรียมสอบแบบมีเวลา 3 ชั่วโมง

- **45 นาทีแรก:** ฝึก Insert at Head + Two Sum + Search Insert Position ให้คล่อง
- **45 นาทีถัดมา:** ฝึก Binary Search และเปรียบเทียบกับ Search Insert Position
- **60 นาทีถัดมา:** ทำ Group Anagrams และ Top K Frequent โดยไม่เปิดเฉลย
- **30 นาทีสุดท้าย:** ทวน Edge Cases, Complexity และเขียนอธิบายวิธีคิดด้วยตัวเอง

เกณฑ์ผ่านจากภาพ: ทำ Easy ให้ได้อย่างน้อย 2 ข้อ หรือ Medium 1 ข้อ ในระยะเวลา 3 ชั่วโมง (ตามข้อความที่ปรากฏในภาพ ทั้งนี้เกณฑ์การส่งจริงให้ยึดระบบใน Session)

# แหล่งฝึกเพิ่มเติม

- LeetCode — Two Sum: https://leetcode.com/problems/two-sum/
- LeetCode — Group Anagrams: https://leetcode.com/problems/group-anagrams/
- LeetCode — Search Insert Position: https://leetcode.com/problems/search-insert-position/
- LeetCode — Binary Search: https://leetcode.com/problems/binary-search/
- LeetCode — Top K Frequent Elements: https://leetcode.com/problems/top-k-frequent-elements/
- HackerRank — Insert a node at the head of a linked list: https://www.hackerrank.com/challenges/insert-a-node-at-the-head-of-a-linked-list/problem

ข้อสำคัญ: วิธีเฉลยนี้สมมติ Array เป็นตัวเลขปกติและลักษณะโจทย์ตามมาตรฐานทั่วไป หากแพลตฟอร์มของทีมกำหนดรูปแบบ Input, Output หรือชื่อ Function ต่างไป ให้ทำตามโจทย์ที่เปิดได้ใน Session นั้น
