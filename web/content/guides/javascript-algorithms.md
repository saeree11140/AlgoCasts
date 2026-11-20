เริ่มจากสิ่งที่โจทย์ให้หา เช่น จำนวนครั้งที่เจอค่า ตำแหน่งแรก หรือผลรวมของช่วง จากนั้นเลือกเครื่องมือ JavaScript ที่ตรงกับงาน ในคู่มือนี้แต่ละตัวอย่างมีอินพุตและผลลัพธ์ให้ลองเทียบ

<nav aria-label="สารบัญ JavaScript สำหรับ Algorithms">

- [Loop และ Array Methods](#/reading/javascript-algorithms?section=arrays)
- [String และการเตรียมข้อความ](#/reading/javascript-algorithms?section=strings)
- [Map และ Set](#/reading/javascript-algorithms?section=map-set)
- [Two Pointers และ Sliding Window](#/reading/javascript-algorithms?section=pointers)
- [Binary Search และขอบเขต](#/reading/javascript-algorithms?section=binary-search)
- [Stack และ Queue](#/reading/javascript-algorithms?section=stack-queue)
- [Recursion และ Memoization](#/reading/javascript-algorithms?section=recursion)
- [Number และกรณีขอบ](#/reading/javascript-algorithms?section=numbers)

</nav>

<h2 id="arrays">1. Loop และ Array Methods</h2>

ใช้ `for...of` เมื่อสนใจค่า ใช้ `for` หรือ `array.entries()` เมื่อโจทย์ต้องการ index ลูปเหมาะกับงานที่ต้องหยุดด้วย `break` หรือ `return`

| ต้องการ | ใช้ |
| --- | --- |
| แปลงทุกสมาชิกหรือเก็บสมาชิกที่ผ่านเงื่อนไข | `map()` หรือ `filter()` |
| หาค่าตัวแรกที่ผ่านเงื่อนไขหรือหา index | `find()` หรือ `findIndex()` |
| เช็กว่ามีอย่างน้อยหนึ่งตัวหรือทุกตัวผ่าน | `some()` หรือ `every()` |
| สะสมเป็นผลรวม | `reduce(fn, 0)` ระบุค่าเริ่มต้นเพื่อให้ใช้กับ array ว่างได้ |
| คัดช่วงหรือแก้ช่วงใน array เดิม | `slice(start, end)` หรือ `splice(start, count)` |

`sort()` เรียงตามข้อความเมื่อไม่ใส่ comparator และแก้ array เดิม ถ้าต้องเรียงตัวเลขและเก็บอินพุตไว้ ให้คัดลอกก่อนแล้วใช้ `(a, b) => a - b` [ECMAScript Array.prototype.sort](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.sort)

```js
const numbers = [10, 2, -3, 2];
const sorted = [...numbers].sort((a, b) => a - b);

console.log(sorted);                     // [-3, 2, 2, 10]
console.log(numbers);                    // [10, 2, -3, 2]
console.log(numbers.slice(1, 3));         // [2, -3]
console.log(numbers.findIndex(x => x < 0)); // 2
console.log([].reduce((sum, x) => sum + x, 0)); // 0
```

ถ้าสร้างตาราง 2 มิติ ให้สร้าง array ใหม่ทุกแถวด้วย `Array.from({ length: rows }, () => Array(cols).fill(0))` การใช้ `Array(rows).fill(Array(cols).fill(0))` ทำให้ทุกแถวอ้างถึง array เดียวกัน

ลองกับ [Array Chunking](#/problem/chunk) และ [Spiral Matrix](#/problem/matrix)

<h2 id="strings">2. String และการเตรียมข้อความ</h2>

อ่านให้ชัดว่าโจทย์ให้นับช่องว่าง เครื่องหมาย และตัวพิมพ์เล็กใหญ่หรือไม่ ตัวอย่างนี้รับเฉพาะตัวอักษรอังกฤษกับตัวเลข และใช้ `replace()` กับ `g` เพื่อลบเครื่องหมายทุกตำแหน่ง จากนั้นใช้ `split()` และ `join()` เมื่อต้องแปลงระหว่าง string กับ array

```js
function normalizeAscii(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function reverseAscii(text) {
  return normalizeAscii(text).split('').reverse().join('');
}

console.log(normalizeAscii('Never odd or even!')); // 'neveroddoreven'
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

ใน Two Sum เก็บ `ค่า → index` ของสมาชิกที่เดินผ่านแล้ว ก่อนเก็บค่าปัจจุบันให้ค้นหา `target - ค่า` ใน Map วิธีนี้จึงรองรับค่าซ้ำอย่าง `[3, 3]` และใช้คนละ index

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

**Two Pointers** ใช้ตัวชี้สองตัวเพื่อพิจารณาข้อมูลร่วมกัน เช่น Palindrome ใช้ `left = 0` กับ `right = text.length - 1` เทียบทีละคู่แล้วขยับเข้าหากัน สำหรับโจทย์หาคู่ผลบวกใน array ที่เรียงแล้ว เมื่อผลรวมน้อยกว่าเป้าหมายให้ขยับฝั่งซ้ายเพื่อเพิ่มค่า และเมื่อมากกว่าให้ขยับฝั่งขวาเพื่อลดค่า

**Sliding Window** เหมาะกับช่วงที่สมาชิกต้องติดกัน ตัวอย่างหาผลรวมสูงสุดของช่วงยาว `k` คำนวณผลรวมช่วงแรก จากนั้นบวกตัวเข้าและลบตัวออกเมื่อขยับไปหนึ่งช่อง

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
console.log(maxWindowSum([-5, -2, -3], 2));        // -5
console.log(maxWindowSum([1], 2));                 // null
```

ใช้เวลา O(n) และพื้นที่เพิ่ม O(1) ตั้ง `best` จากช่วงแรกจริงเพื่อรองรับค่าติดลบ ถ้าโจทย์ถามผลรวมของหลายช่วงที่กำหนดล่วงหน้า ให้เก็บ **Prefix Sum** โดยให้ `prefix[i]` เป็นผลรวมของสมาชิกก่อน index `i` แล้วคำนวณช่วง `[left, right)` ด้วย `prefix[right] - prefix[left]`

ลองแนวคิดตัวชี้สองฝั่งกับ [Palindrome](#/problem/palindrome)

<h2 id="binary-search">5. Binary Search และขอบเขต</h2>

ใช้กับ array ที่เรียงจากน้อยไปมาก ตัวอย่างนี้หา **index แรกที่ค่า ≥ target** หรือจุดแทรก ใช้ช่วงครึ่งเปิด `[left, right)` โดยเริ่ม `right` ที่ `numbers.length` จึงรองรับกรณีที่ต้องแทรกท้ายและ array ว่าง

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

console.log(lowerBound([1, 3, 3, 5], 3)); // 1
console.log(lowerBound([1, 3, 3, 5], 4)); // 3
console.log(lowerBound([1, 3, 3, 5], 9)); // 4
console.log(lowerBound([], 9));           // 0
```

ใช้เวลา O(log n) และพื้นที่เพิ่ม O(1) ถ้าโจทย์ถามว่าพบค่าเป้าหมายไหม ให้เช็กว่า index ที่ได้ยังอยู่ใน array และ `numbers[index] === target`

ลองกับ [Search Insert Position](#/problem/search-insert) และ [Binary Search](#/problem/binary-search)

<h2 id="stack-queue">6. Stack และ Queue</h2>

**Stack** ใช้ `push()` และ `pop()` เพื่อหยิบตัวที่เพิ่งใส่ล่าสุด เช่น เวลาเจอวงเล็บเปิดให้เก็บไว้ เวลาเจอวงเล็บปิดให้หยิบตัวบนสุดมาเทียบ แล้วเช็กว่า stack ว่างเมื่อจบ

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
```

ใส่ใน `visited` ตอนเข้าคิวเพื่อให้แต่ละโหนดเข้าคิวครั้งเดียว ภายใต้สมมติฐาน lookup เฉลี่ย O(1) การเดินนี้ใช้เวลา O(V + E) สำหรับโหนดและเส้นเชื่อมที่เข้าถึงได้ และใช้พื้นที่เพิ่ม O(V)

ลองกับ [Queue](#/problem/queue) และ [Tree Traversal](#/problem/tree)

<h2 id="recursion">7. Recursion และ Memoization</h2>

กำหนด base case ก่อน แล้วให้ทุก call ลดขนาดปัญหาหรือขยับเข้าใกล้จุดหยุด ใช้ `Map` เก็บผลตามอินพุตเมื่อเจอปัญหาย่อยเดิมซ้ำ เช่น Fibonacci ที่มี `fib(n - 1)` และ `fib(n - 2)` คำนวณค่าบางตัวซ้ำกัน

```js
// รับจำนวนเต็ม n ตั้งแต่ 0 ถึง 78 เพื่อให้ผลยังแม่นยำใน Number
function fib(n, memo = new Map([[0, 0], [1, 1]])) {
  if (memo.has(n)) return memo.get(n);
  const answer = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, answer);
  return answer;
}

console.log(fib(0));  // 0
console.log(fib(10)); // 55
```

ส่ง memo ตัวเดียวกันลงไปในแต่ละ call จึงคำนวณแต่ละ `n` ครั้งเดียว ใช้เวลา O(n) เมื่อคิดว่า lookup เฉลี่ย O(1) และใช้พื้นที่ O(n) นับทั้ง Map และ call stack ถ้าความลึกอาจสูงมาก ให้พิจารณาวนลูปหรือใช้ stack ของตัวเอง

ลองกับ [Fibonacci](#/problem/fib)

<h2 id="numbers">8. Number และกรณีขอบ</h2>

- `Math.floor(-2.7)` ได้ `-3` ส่วน `Math.trunc(-2.7)` ได้ `-2` เลือกตามที่โจทย์ต้องการปัดลงหรือตัดทศนิยม
- `%` ให้เศษที่อาจติดลบ ใช้ `((i % length) + length) % length` เมื่อต้องการ index วนกลับสำหรับ array ที่มีสมาชิกอย่างน้อยหนึ่งตัว
- เมื่ออินพุตหรือผลคำนวณจำนวนเต็มอาจเกิน `Number.MAX_SAFE_INTEGER` ให้ใช้ `BigInt` ตั้งแต่แปลงอินพุตและตรวจชนิดผลลัพธ์ตามโจทย์ `BigInt('9007199254740993')` รับค่าจำนวนเต็มได้ตรงจากข้อความ [ECMAScript Numeric Types](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-numeric-types)

```js
console.log(Math.floor(-2.7)); // -3
console.log(Math.trunc(-2.7)); // -2
console.log(((-1 % 5) + 5) % 5); // 4
console.log((BigInt('9007199254740993') + 1n).toString()); // '9007199254740994'
```

ก่อนส่ง ลอง input ว่าง สมาชิกเดียว ค่าซ้ำ ศูนย์ ค่าติดลบ และกรณีหาไม่เจอเท่าที่สัญญาโจทย์อนุญาต เช็กว่าคืน **ค่า** หรือ **index** ตามที่ขอ และลำดับผลลัพธ์ตรงกับโจทย์

ลองกับ [Reverse Integer](#/problem/reverseint)
