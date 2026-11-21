เริ่มจากสิ่งที่โจทย์ให้หา เช่น จำนวนครั้งที่เจอค่า ตำแหน่งแรก หรือผลรวมของช่วง จากนั้นเลือกเครื่องมือ JavaScript ที่ตรงกับงาน ในคู่มือนี้แต่ละตัวอย่างมีอินพุตและผลลัพธ์ให้ลองเทียบ

<nav aria-label="สารบัญ JavaScript สำหรับ Algorithms">

- [Loop และ Array Methods](#/reading/javascript-algorithms?section=arrays)
  - [เลือกใช้ forEach, for...in และ for...of](#/reading/javascript-algorithms?section=loop-choices)
- [String และการเตรียมข้อความ](#/reading/javascript-algorithms?section=strings)
- [Map และ Set](#/reading/javascript-algorithms?section=map-set)
- [Two Pointers และ Sliding Window](#/reading/javascript-algorithms?section=pointers)
- [Binary Search และขอบเขต](#/reading/javascript-algorithms?section=binary-search)
- [Stack และ Queue](#/reading/javascript-algorithms?section=stack-queue)
- [Recursion และ Memoization](#/reading/javascript-algorithms?section=recursion)
- [Number และกรณีขอบ](#/reading/javascript-algorithms?section=numbers)

</nav>

<h2 id="arrays">1. Loop และ Array Methods</h2>

ตัวอย่างหลักใช้ `const numbers = [10, 2, -3, 2];` ซึ่งมี index 0 ถึง 3

<h3 id="loop-choices">เลือกใช้ forEach, for...in และ for...of</h3>

| งานที่ต้องทำ | เลือกใช้ | สิ่งที่ได้แต่ละรอบ |
| --- | --- | --- |
| เก็บตำแหน่งของจำนวนติดลบทุกตัว | `numbers.forEach((value, index) => …)` | callback รับค่า, index แบบตัวเลข และ array ต้นทางเป็นอาร์กิวเมนต์ที่สาม |
| อ่านตารางความถี่ที่เก็บเป็น object | `for (const key in counts)` | ชื่อ property ชนิด string ที่ enumerable อ่านค่าด้วย `counts[key]` |
| หยุดเมื่อเจอจำนวนติดลบตัวแรก | `for (const [index, value] of numbers.entries())` | คู่ index กับค่า ใช้ `break` หรือออกจากฟังก์ชันด้วย `return` ได้ทันที |

**เมื่อต้องการทุกตำแหน่ง** ใช้ `forEach` สะสมคำตอบใน array ภายนอก ตัวเมธอดคืน `undefined` และ `return` ใน callback จบเฉพาะการเรียกครั้งนั้น

```js
const numbers = [10, 2, -3, 2];
const negatives = [];
numbers.forEach((value, index) => {
  if (value < 0) negatives.push(index);
});
console.log(negatives); // [2]
```

**เมื่อต้องการชื่อ property** ลองหาความถี่รวมจาก object ด้านล่าง `for...in` มองเห็น property ที่ enumerable บน prototype ด้วย จึงใช้ `Object.hasOwn` เพื่อรวมเฉพาะข้อมูลของ object นี้ ถ้าใช้ `for...in` กับ array จะได้ key เช่น `"0"` และอาจเจอ property อื่นที่เพิ่มเข้ามา

```js
const counts = Object.create({ baseline: 100 });
counts.red = 3;
counts.blue = 2;

let total = 0;
for (const key in counts) {
  if (Object.hasOwn(counts, key)) total += counts[key];
}
console.log(total); // 5
```

**เมื่อต้องการค่าทีละตัวและหยุดได้** ใช้ `for...of` กับ iterable เช่น Array, String, Set, Map หรือค่าที่ generator ส่งออกด้วย `yield` สำหรับ array ใช้ `for (const value of numbers)` เพื่ออ่านค่าโดยตรง หรือใช้ `numbers.entries()` เมื่อต้องคืน index สำหรับ object ธรรมดาที่ต้องการทั้งชื่อและค่า ใช้ `for (const [key, value] of Object.entries(counts))`

```js
function firstNegativeIndex(numbers) {
  for (const [i, x] of numbers.entries()) {
    if (x < 0) return i; // เจอแล้วออกทันที ไม่ดูตัวที่เหลือ
  }
  return -1; // เดินครบแล้วไม่เจอ
}

console.log(firstNegativeIndex([10, 2, -3, 2])); // 2
console.log(firstNegativeIndex([1, 2]));         // -1
```

อ่านเรื่อง enumerable และ iterable เพิ่มเติมได้จากบทความของ Nuttavut Thongjor ที่เป็นที่มาของหัวข้อนี้ [บทความเปรียบเทียบลูปบน Babel Coder](https://www.babelcoder.com/articles/for-each-vs-for-in-vs-for-of)

### Array methods ที่ใช้บ่อย

| ต้องการ | ใช้ | ตัวอย่าง | ผลลัพธ์ |
| --- | --- | --- | --- |
| แปลงทุกตัว ได้ array ยาวเท่าเดิม | `map(fn)` | `numbers.map(x => x * 2)` | `[20, 4, -6, 4]` |
| เก็บเฉพาะตัวที่ผ่านเงื่อนไข | `filter(fn)` | `numbers.filter(x => x > 0)` | `[10, 2, 2]` |
| ค่าของตัวแรกที่ผ่านเงื่อนไข | `find(fn)` | `numbers.find(x => x < 0)` | `-3` ถ้าไม่เจอได้ `undefined` |
| index ของตัวแรกที่ผ่านเงื่อนไข | `findIndex(fn)` | `numbers.findIndex(x => x < 0)` | `2` ถ้าไม่เจอได้ `-1` |
| มีอย่างน้อยหนึ่งตัวผ่านไหม | `some(fn)` | `numbers.some(x => x < 0)` | `true` |
| ทุกตัวผ่านไหม | `every(fn)` | `numbers.every(x => x > 0)` | `false` |
| รวมทุกตัวเป็นค่าเดียว | `reduce(fn, ค่าเริ่มต้น)` | `numbers.reduce((sum, x) => sum + x, 0)` | `11` |
| คัดช่วงเป็น array ใหม่ | `slice(start, end)` | `numbers.slice(1, 3)` | `[2, -3]` คือ index 1 และ 2 ไม่รวม index 3 |
| ลบสมาชิกออกจาก array เดิม | `splice(start, count)` | `numbers.splice(1, 2)` | คืน `[2, -3]` และ `numbers` เหลือ `[10, 2]` |

จุดที่พลาดบ่อย

- **เช็กผลของ `find()` และ `findIndex()` ให้ตรงค่าที่ใช้บอกว่าไม่เจอ** ใช้ `index !== -1` และ `value !== undefined` อย่าเขียน `if (index)` เพราะ index 0 ถือเป็นเท็จ ถ้าตัวแรกผ่านเงื่อนไข โค้ดจะเข้าใจผิดว่าไม่เจอ
- **ใส่ค่าเริ่มต้นให้ `reduce()` เสมอ** `[].reduce((sum, x) => sum + x, 0)` ได้ `0` แต่ถ้าไม่ใส่ `0` จะเกิด `TypeError` เพราะ array ว่างไม่มีตัวแรกให้เริ่มรวม
- **`slice()` กับ `splice()` ชื่อคล้ายกันแต่ทำงานต่างกัน** `slice()` คืน array ใหม่และไม่แตะของเดิม ส่วน `splice()` ลบออกจาก array เดิมจริง ตัวอื่นในตารางไม่แก้ array เดิมเลย

### `sort()` มีกับดักสองข้อ

1. ถ้าไม่ใส่ comparator จะแปลงทุกตัวเป็นข้อความแล้วเรียงตามตัวอักษร `"10"` จึงมาก่อน `"2"` เพราะเทียบตัวแรก `"1"` กับ `"2"`
2. `sort()` แก้ array เดิม ถ้าต้องเก็บอินพุตไว้ให้คัดลอกด้วย `[...numbers]` ก่อน

comparator `(a, b) => a - b` คืนค่าติดลบเมื่อ `a` ควรมาก่อน `b` จึงได้ลำดับน้อยไปมาก ถ้าสลับเป็น `b - a` จะได้มากไปน้อย [ECMAScript Array.prototype.sort](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.sort)

```js
const numbers = [10, 2, -3, 2];

console.log([...numbers].sort());                // [-3, 10, 2, 2] เรียงแบบข้อความ
console.log([...numbers].sort((a, b) => a - b)); // [-3, 2, 2, 10] น้อยไปมาก
console.log([...numbers].sort((a, b) => b - a)); // [10, 2, 2, -3] มากไปน้อย
console.log(numbers);                            // [10, 2, -3, 2] ต้นฉบับไม่เปลี่ยน
```

### สร้างตาราง 2 มิติ

`fill(ค่า)` ใส่ค่าเดียวกันทุกช่อง ถ้าค่านั้นเป็น array ทุกแถวจะชี้ไปที่ array ตัวเดียวกัน แก้แถวหนึ่งแล้วแถวอื่นเปลี่ยนตาม ให้ใช้ `Array.from()` แทน เพราะมันเรียกฟังก์ชันใหม่ทุกแถว ทุกแถวจึงได้ array ของตัวเอง

```js
const wrong = Array(2).fill(Array(3).fill(0));
wrong[0][0] = 1;
console.log(wrong); // [[1, 0, 0], [1, 0, 0]] แถวที่ 2 เปลี่ยนตาม

const grid = Array.from({ length: 2 }, () => Array(3).fill(0));
grid[0][0] = 1;
console.log(grid);  // [[1, 0, 0], [0, 0, 0]] เปลี่ยนเฉพาะแถวแรก
```

ลองกับ [Array Chunking](#/problem/chunk) และ [Spiral Matrix](#/problem/matrix)

<h2 id="strings">2. String และการเตรียมข้อความ</h2>

อ่านให้ชัดว่าโจทย์ให้นับช่องว่าง เครื่องหมาย และตัวพิมพ์เล็กใหญ่หรือไม่ ตัวอย่างนี้เก็บเฉพาะ A–Z, a–z และ 0–9 จากข้อความต้นทาง แล้วแปลงเป็นตัวพิมพ์เล็ก เมื่อเหลือเฉพาะ ASCII จึงใช้ `split('')` แยกทีละตัว กลับลำดับ และใช้ `join('')` รวมเป็นข้อความได้

```js
function normalizeAscii(text) {
  return text.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
}

function reverseAscii(text) {
  return normalizeAscii(text).split('').reverse().join('');
}

console.log(normalizeAscii('Never odd or even!')); // 'neveroddoreven'
console.log(normalizeAscii('ไทย A9!'));           // 'a9'
console.log(reverseAscii('Ab-12'));               // '21ba'
```

ถ้าโจทย์รองรับ Unicode ให้ตกลงก่อนว่านับเป็น code point หรือตัวอักษรที่ผู้ใช้อ่านเห็น `for...of` และ `[...text]` เดินตาม code point ส่วน `text.length` นับ UTF-16 code unit ตัวอักษรที่มีสระ เครื่องหมายประกอบ หรืออีโมจิบางตัวอาจประกอบด้วยหลาย code point [ECMAScript String Iterator](https://tc39.es/ecma262/multipage/text-processing.html#sec-string-iterator)

ลองกับ [Palindrome](#/problem/palindrome) และ [Group Anagrams](#/problem/group-anagrams)

<h2 id="map-set">3. Map และ Set</h2>

ใช้ `Map` เมื่อแต่ละ key มีข้อมูลกำกับ เช่น จำนวนครั้งหรือ index ใช้ `Set` เมื่อแค่ต้องรู้ว่าเคยพบแล้วหรือยัง สำหรับ frequency map ใช้ `(counts.get(value) ?? 0) + 1` เพื่อเริ่มจากศูนย์เวลาไม่มี key

```js
function frequencies(values) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

console.log([...frequencies(['a', 'b', 'a'])]); // [['a', 2], ['b', 1]]
console.log([...new Set([3, 3, 1, 3])]);       // [3, 1]
```

Two Sum คืน index สองตำแหน่งที่ค่ารวมกันได้ target หรือคืน `[]` เมื่อหาคู่ไม่ได้ ให้เก็บ `ค่า → index` ของสมาชิกที่เดินผ่านแล้ว และค้นหา `target - ค่า` ก่อนเก็บสมาชิกปัจจุบัน เมื่อเจอ 3 ตัวที่สองใน `[3, 3]` จึงจับคู่กับ 3 ตัวแรกได้โดยใช้คนละ index

```js
function twoSumIndices(numbers, target) {
  const seen = new Map();
  for (const [index, value] of numbers.entries()) {
    const other = target - value;
    if (seen.has(other)) return [seen.get(other), index];
    seen.set(value, index);
  }
  return [];
}

console.log(twoSumIndices([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSumIndices([3, 3], 6));        // [0, 1]
console.log(twoSumIndices([3], 6));           // []
```

ความซับซ้อนที่ใช้วิเคราะห์โจทย์นี้คือเวลา O(n) เมื่อคิดว่า lookup เฉลี่ย O(1) และพื้นที่ O(n) มาตรฐาน JavaScript ระบุเพียงว่าเวลาเข้าถึงโดยเฉลี่ยโตช้ากว่าเชิงเส้น [ECMAScript Keyed Collections](https://tc39.es/ecma262/multipage/keyed-collections.html)

ลองกับ [Two Sum](#/problem/two-sum) และ [Top K Frequent Elements](#/problem/top-k-frequent)

<h2 id="pointers">4. Two Pointers และ Sliding Window</h2>

**Two Pointers** ใช้ตัวชี้สองตัวเพื่อพิจารณาข้อมูลร่วมกัน เช่น Palindrome ของข้อความ ASCII ที่เตรียมแล้ว ใช้ `left = 0` กับ `right = text.length - 1` เทียบทีละคู่แล้วขยับเข้าหากัน สำหรับโจทย์หาคู่ผลบวกใน array ที่เรียงจากน้อยไปมาก เมื่อผลรวมน้อยกว่าเป้าหมายให้ขยับฝั่งซ้ายไปทางขวา เมื่อมากกว่าเป้าหมายให้ขยับฝั่งขวาไปทางซ้าย หยุดเมื่อเจอคู่หรือเมื่อตัวชี้มาพบกัน

**Sliding Window** เหมาะกับช่วงที่สมาชิกต้องติดกัน ตัวอย่างนี้คืนผลรวมสูงสุดของช่วงยาว `size` เริ่มจากผลรวมช่วงแรก แล้วบวกตัวเข้าและลบตัวออกเมื่อขยับไปหนึ่งช่อง ถ้า `size` ไม่ใช่จำนวนเต็มในช่วง 1 ถึงจำนวนสมาชิก ฟังก์ชันนี้คืน `null`

```js
function maxWindowSum(numbers, size) {
  if (!Number.isInteger(size) || size < 1 || size > numbers.length) return null;

  let sum = 0;
  for (let i = 0; i < size; i++) sum += numbers[i];
  let best = sum;

  for (let right = size; right < numbers.length; right++) {
    sum += numbers[right] - numbers[right - size];
    best = Math.max(best, sum);
  }
  return best;
}

console.log(maxWindowSum([2, 1, 5, 1, 3, 2], 3)); // 9
// สองช่วงมีผลรวม -7 และ -5 ค่าสูงสุดจึงยังติดลบ
console.log(maxWindowSum([-5, -2, -3], 2));        // -5
console.log(maxWindowSum([1], 2));                 // null
```

ใช้เวลา O(n) และพื้นที่เพิ่ม O(1) ตั้ง `best` จากช่วงแรกจริงเพื่อรองรับค่าติดลบ ถ้าโจทย์ถามผลรวมของหลายช่วงที่กำหนดล่วงหน้า ให้เก็บ **Prefix Sum** โดยให้ `prefix[i]` เป็นผลรวมของสมาชิกก่อน index `i` แล้วคำนวณช่วง `[left, right)` ด้วย `prefix[right] - prefix[left]`

ลองแนวคิดตัวชี้สองฝั่งกับ [Palindrome](#/problem/palindrome)

<h2 id="binary-search">5. Binary Search และขอบเขต</h2>

ใน array ที่เรียงจากน้อยไปมาก มีสองคำถามที่หน้าตาคล้ายกันแต่คำตอบต่างกัน

- `lowerBound(numbers, target)` ถามว่า **target ควรอยู่ที่ index ไหน** คือคืน index แรกที่ `numbers[i] >= target` ฟังก์ชันนี้ไม่มีกรณี "ไม่เจอ" เพราะแทรก target ได้เสมอ คำตอบจึงอยู่ระหว่าง 0 ถึง `numbers.length` และได้ `numbers.length` เมื่อทุกค่าน้อยกว่า target
- `binarySearch(numbers, target)` ถามว่า **มี target อยู่จริงไหม** ฟังก์ชันนี้เรียก `lowerBound` ก่อน แล้วเช็กค่าที่ตำแหน่งนั้น ถ้าไม่ใช่ target ก็คืน `-1`

ตัวอย่างกับ `[1, 3, 3, 5]` ที่มี index 0 ถึง 3

| target | `lowerBound` ควรอยู่ที่ index | `binarySearch` เจอที่ index |
| --- | --- | --- |
| 3 | 1 ก่อนเลข 3 ตัวแรก | 1 เพราะ `numbers[1] === 3` |
| 4 | 3 ไม่มีเลข 4 แต่ 4 ต้องอยู่ก่อนเลข 5 | −1 เพราะ `numbers[3]` คือ 5 ไม่ใช่ 4 |
| 9 | 4 ทุกค่าน้อยกว่า 9 จึงต่อท้าย array | −1 เพราะ index 4 เลยท้าย array |

โค้ดใช้ช่วงครึ่งเปิด `[left, right)` และเริ่มที่ `right = numbers.length` เพื่อให้ตอบตำแหน่งท้าย array ได้ เมื่อค่ากลางน้อยกว่า target คำตอบต้องอยู่ทางขวา จึงใช้ `left = mid + 1` เมื่อค่ากลางมากกว่าหรือเท่ากับ target ตัว `mid` เองอาจเป็นคำตอบ จึงเก็บไว้ด้วย `right = mid`

```js
function lowerBound(numbers, target) {
  let left = 0;
  let right = numbers.length;

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (numbers[mid] < target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}

function binarySearch(numbers, target) {
  const index = lowerBound(numbers, target);
  if (index < numbers.length && numbers[index] === target) return index;
  return -1;
}

// lowerBound คืนตำแหน่งที่ target ควรอยู่ ไม่ได้บอกว่าเจอหรือไม่
console.log(lowerBound([1, 3, 3, 5], 3)); // 1
console.log(lowerBound([1, 3, 3, 5], 4)); // 3 ไม่มี 4 แต่ควรอยู่ก่อน 5
console.log(lowerBound([1, 3, 3, 5], 9)); // 4 ต่อท้าย array
console.log(lowerBound([], 9));           // 0

// binarySearch คืน index ที่เจอ หรือ -1 เมื่อไม่เจอ
console.log(binarySearch([1, 3, 3, 5], 3)); // 1
console.log(binarySearch([1, 3, 3, 5], 4)); // -1
console.log(binarySearch([1, 3, 3, 5], 9)); // -1
```

ทั้งสองฟังก์ชันใช้เวลา O(log n) และพื้นที่เพิ่ม O(1)

ลองกับ [Search Insert Position](#/problem/search-insert) และ [Binary Search](#/problem/binary-search)

<h2 id="stack-queue">6. Stack และ Queue</h2>

**Stack** ใช้ `push()` เก็บวงเล็บเปิด และ `pop()` หยิบตัวที่เก็บล่าสุดมาเทียบเมื่อเจอวงเล็บปิด ถ้า stack ว่างตอนเจอวงเล็บปิดหรือชนิดวงเล็บไม่ตรงกัน ให้คืน false ทันที เมื่ออ่านครบให้คืนว่า stack ว่างหรือไม่

**Queue** ใช้กับ BFS ที่ต้องเดินทีละระดับ ใน JavaScript ใช้ array คู่กับ index `head` เพื่ออ่านคิวจากด้านหน้าโดยไม่ต้องเลื่อนสมาชิกด้วย `shift()` ทุกครั้ง

```js
function breadthFirst(graph, start) {
  const queue = [start];
  const visited = new Set([start]);

  for (let head = 0; head < queue.length; head++) {
    for (const next of graph.get(queue[head]) ?? []) {
      if (visited.has(next)) continue;
      visited.add(next);
      queue.push(next);
    }
  }
  return queue;
}

const graph = new Map([
  ['A', ['B', 'C']],
  ['B', ['D']],
  ['C', ['D']],
  ['D', ['A']],
]);
console.log(breadthFirst(graph, 'A')); // ['A', 'B', 'C', 'D']
console.log(breadthFirst(new Map([['A', []]]), 'A')); // ['A']
```

ผลลัพธ์คือรายชื่อโหนดที่เข้าถึงได้จาก `start` ตามลำดับที่พบ ในตัวอย่าง A มีเพื่อนบ้านเรียงเป็น B แล้ว C จึงได้ B ก่อน C แม้ทั้งคู่ห่างจาก A หนึ่งเส้นเชื่อมเท่ากัน ใส่ใน `visited` ตอนเข้าคิวเพื่อให้แต่ละโหนดเข้าคิวครั้งเดียว ภายใต้สมมติฐาน lookup เฉลี่ย O(1) การเดินนี้ใช้เวลา O(V + E) สำหรับโหนดและเส้นเชื่อมที่เข้าถึงได้ และใช้พื้นที่เพิ่ม O(V)

ลองกับ [Queue](#/problem/queue) และ [Tree Traversal](#/problem/tree)

<h2 id="recursion">7. Recursion และ Memoization</h2>

กำหนด base case ก่อน แล้วให้ทุก call ลดขนาดปัญหาหรือขยับเข้าใกล้จุดหยุด ใช้ `Map` เก็บผลตามอินพุตเมื่อเจอปัญหาย่อยเดิมซ้ำ เช่น Fibonacci ที่มี `fib(n - 1)` และ `fib(n - 2)` คำนวณค่าบางตัวซ้ำกัน

```js
// รับจำนวนเต็ม n ตั้งแต่ 0 ถึง 78 เพื่อให้ผลยังแม่นยำใน Number
function fib(n) {
  if (!Number.isInteger(n) || n < 0 || n > 78) {
    throw new RangeError('n ต้องเป็นจำนวนเต็มตั้งแต่ 0 ถึง 78');
  }
  const memo = new Map([[0, 0], [1, 1]]);
  function compute(i) {
    if (memo.has(i)) return memo.get(i);
    const answer = compute(i - 1) + compute(i - 2);
    memo.set(i, answer);
    return answer;
  }
  return compute(n);
}

console.log(fib(0));  // 0
console.log(fib(10)); // 55
```

การเรียก `compute` ภายใน `fib` ครั้งเดียวกันใช้ Map ร่วมกัน จึงคำนวณแต่ละพจน์ครั้งเดียว ใช้เวลา O(n) เมื่อคิดว่า lookup เฉลี่ย O(1) และใช้พื้นที่ O(n) นับทั้ง Map และ call stack ตัวอย่างนี้ตรวจช่วงก่อนเริ่ม เพราะพจน์ที่ 79 เกิน `Number.MAX_SAFE_INTEGER`

ลองกับ [Fibonacci](#/problem/fib)

<h2 id="numbers">8. Number และกรณีขอบ</h2>

- `Math.floor(-2.7)` ได้ `-3` ส่วน `Math.trunc(-2.7)` ได้ `-2` เลือกตามที่โจทย์ต้องการปัดลงหรือตัดทศนิยม
- `%` ให้เศษที่อาจติดลบ ใช้ `((i % length) + length) % length` เมื่อต้องการ index วนกลับสำหรับ array ที่มีสมาชิกอย่างน้อยหนึ่งตัว
- เมื่ออินพุตหรือผลคำนวณจำนวนเต็มอาจอยู่นอกช่วง `Number.MIN_SAFE_INTEGER` ถึง `Number.MAX_SAFE_INTEGER` ให้ใช้ `BigInt` ตั้งแต่แปลงอินพุต เช่น `BigInt('9007199254740993')` รับค่าได้ตรงจากข้อความ ใช้ `1n` เมื่อต้องบวกหนึ่งกับ BigInt เพราะการบวก BigInt กับ Number จะเกิด TypeError [ECMAScript Numeric Types](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-numeric-types)

```js
console.log(Math.floor(-2.7)); // -3
console.log(Math.trunc(-2.7)); // -2
console.log(((-1 % 5) + 5) % 5); // 4
console.log((BigInt('9007199254740993') + 1n).toString()); // '9007199254740994'
```

ก่อนส่ง ลอง input ว่าง สมาชิกเดียว ค่าซ้ำ ศูนย์ ค่าติดลบ และกรณีหาไม่เจอเท่าที่สัญญาโจทย์อนุญาต เช็กว่าคืน **ค่า** หรือ **index** ตามที่ขอ และลำดับผลลัพธ์ตรงกับโจทย์

ลองกับ [Reverse Integer](#/problem/reverseint)
