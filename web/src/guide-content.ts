// Thai lesson text for the guides page: one intro per diagram group and a note per diagram.
// Keys are diagram ids from the generated manifest (group-order, e.g. "03-14").

export interface GuideNote {
  /** Short Thai heading shown above the original draw.io title. */
  title: string;
  summary: string;
  points?: string[];
  /** Lab mode to open from this note. */
  lab?: string;
  /** Duplicate or off-topic slide: keep it out of the lesson list. */
  hidden?: boolean;
}

export interface GuideGroup { summary: string; goals: string[]; problems: string[] }

export const guideGroups: Record<string, GuideGroup> = {
  '01': {
    summary: 'ภาพรวมการสัมภาษณ์งาน Developer ว่าบริษัทวัดอะไรในแต่ละช่วง และควรฝึกอย่างไรให้ทำโจทย์แบบ whiteboard ได้',
    goals: ['รู้ว่ารอบสัมภาษณ์แต่ละรอบวัดอะไร', 'แยกโจทย์สาย practical กับ theoretical ได้', 'ลองโจทย์วอร์มอัพ FizzBuzz และ Fibonacci'],
    problems: ['fizzbuzz', 'fib'],
  },
  '02': {
    summary: 'โจทย์ string ส่วนใหญ่แบ่งได้ 3 แบบ: กลับลำดับ, นับตัวอักษร และย่อ string รู้เทคนิคประจำของแต่ละแบบแล้วจะแก้ได้เร็วขึ้นมาก',
    goals: ['กลับ string ได้หลายวิธี (reverse, loop, reduce)', 'ใช้ object นับความถี่ตัวอักษร', 'ใช้ every เช็กเงื่อนไขทุกตัว เช่น palindrome'],
    problems: ['reversestring', 'reverseint', 'palindrome', 'maxchar', 'vowels', 'anagrams'],
  },
  '03': {
    summary: 'ฝึกคิด loop ซ้อนและ recursion ผ่านโจทย์จัดรูปแบบ: chunk, anagram, capitalize, steps, pyramid และ spiral matrix',
    goals: ['วาดตารางแถว/คอลัมน์ก่อนเขียน loop ซ้อน', 'เปลี่ยน loop เป็น recursion ด้วย base case และ argument ที่เปลี่ยนทุกครั้ง', 'จัดการขอบเขต (start/end) แบบ spiral matrix'],
    problems: ['chunk', 'anagrams', 'capitalize', 'steps', 'pyramid', 'matrix'],
  },
  '04': {
    summary: 'Big O บอกว่างานเพิ่มขึ้นแค่ไหนเมื่อข้อมูลเพิ่มขึ้น ส่วน Fibonacci เป็นตัวอย่างคลาสสิกของ recursion ที่ช้าแบบ O(2ⁿ) และแก้ได้ด้วย memoization',
    goals: ['ประเมิน Big O จากรูปแบบ loop', 'อธิบายว่าทำไม fib แบบ recursion ช้า', 'ใช้ memoization ลดงานซ้ำ'],
    problems: ['fib'],
  },
  '05': {
    summary: 'Queue (เข้าก่อนออกก่อน) และ Stack (เข้าหลังออกก่อน) เป็นโครงสร้างข้อมูลพื้นฐานที่จำกัดวิธีเพิ่ม/ลบของ เพื่อให้ใช้งานถูกวิธี',
    goals: ['สร้าง Queue และ Stack จาก array', 'รวมสองคิวสลับกัน (weave)', 'สร้าง Queue จาก Stack สองอัน'],
    problems: ['queue', 'weave', 'stack', 'qfroms'],
  },
  '06': {
    summary: 'Linked List เก็บข้อมูลเป็น node ต่อกันด้วย reference ต่างจาก array ที่เรียงในหน่วยความจำติดกัน ข้อดีข้อเสียจึงสลับกัน',
    goals: ['เข้าใจ node, head, tail และ null', 'เทียบ lookup/insert ของ array กับ linked list', 'เขียน method ของ LinkedList ทั้งชุด'],
    problems: ['linkedlist'],
  },
  '07': {
    summary: 'เทคนิค slow/fast pointer ใช้ pointer สองตัวที่เดินเร็วไม่เท่ากัน หาจุดกลาง ตรวจวง และหา node จากท้าย ได้ใน loop เดียว',
    goals: ['หา midpoint โดยไม่รู้ขนาด list', 'ตรวจว่า list มีวงหรือไม่', 'หา node ที่ห่างจากท้าย n ตำแหน่ง'],
    problems: ['midpoint', 'circular', 'fromlast'],
  },
  '08': {
    summary: 'Tree เก็บข้อมูลเป็นลำดับชั้น เดินได้สองแบบ (BFS ทีละชั้น, DFS ลงลึกก่อน) ส่วน Binary Search Tree จัดค่าให้ซ้ายน้อยขวามากเพื่อค้นหาเร็ว',
    goals: ['สร้าง Node และ Tree พร้อม add/remove', 'เดินต้นไม้แบบ BFS และ DFS', 'insert / contains / validate ใน BST'],
    problems: ['tree', 'levelwidth', 'bst', 'validate'],
  },
  '09': {
    summary: 'Event emitter ที่เป็นพื้นฐานของ DOM event และแนวทางตอบคำถาม System Design ตัวอย่างการออกแบบ Twitter',
    goals: ['เขียน on / trigger / off', 'ตอบ system design เป็นขั้นตอน', 'รู้จัก caching และ load balancer'],
    problems: ['events'],
  },
  '10': {
    summary: 'เปรียบเทียบ Bubble, Selection และ Merge Sort ทั้งวิธีคิดและความเร็ว ใช้ Sorting Lab ด้านบนดูทีละขั้น',
    goals: ['เขียน Bubble และ Selection Sort', 'แยก Merge Sort เป็น split กับ merge', 'อธิบาย O(n²) กับ O(n log n)'],
    problems: ['sorting'],
  },
};

export const guideNotes: Record<string, GuideNote> = {
  // 01 เริ่มต้นแก้โจทย์
  '01-01': { title: 'ขั้นตอนสมัครงาน', summary: 'การสมัครงานแบ่งเป็น 2 ช่วงตามเวลา (แกนตั้งด้านซ้าย): ช่วงติดต่อ แล้วจึงเป็นช่วงสัมภาษณ์', points: ['Contact Phase: คุยกับ recruiter, เพื่อนแนะนำ หรือส่ง resume ออนไลน์', 'Interview Phase: phone screen ก่อน แล้วจึงสัมภาษณ์ที่บริษัท (onsite)'] },
  '01-02': { title: 'แต่ละช่วงวัดอะไร', summary: 'ภาพเดิมเพิ่มสิ่งที่บริษัทดูในแต่ละช่วง', points: ['ช่วงติดต่อดู ประสบการณ์ทำงาน, side project และคนรู้จัก', 'ช่วงสัมภาษณ์ดู 2 เรื่อง: เข้ากับทีมได้ไหม (culture fit) และเขียนโค้ดเป็นไหม (can you code?) ซึ่งเป็นสิ่งที่เว็บนี้ช่วยฝึก', 'take-home assignment เป็นอีกรูปแบบของการวัดว่าเขียนโค้ดเป็นไหม'] },
  '01-03': { title: 'วิธีวัดฝีมือเขียนโค้ด', summary: 'บริษัทใช้ 3 แบบหลัก แต่ละแบบเตรียมตัวต่างกัน', points: ['Take-home: มีเวลาทำที่บ้าน เน้นคุณภาพโค้ดและ test', 'Pair programming: เขียนบนคอมพร้อมคนสัมภาษณ์ ต้องพูดสิ่งที่คิดออกมาด้วย', 'Whiteboarding: เขียนบนกระดานโดยไม่มี editor ช่วย ต้องรู้ syntax และวิธีคิดให้แม่น'] },
  '01-04': { title: 'จะเก่ง whiteboard ได้อย่างไร', summary: 'คำถามนำเข้าเรื่อง คำตอบอยู่ในภาพถัดไป: ฝึกบ่อยๆ และฝึกแบบตั้งใจ' },
  '01-05': { title: 'ฝึก ฝึก และฝึก', summary: 'ไม่มีทางลัด ต้องทำโจทย์ซ้ำจนจำรูปแบบได้', points: ['ทำโจทย์เดิมซ้ำหลังผ่านไปไม่กี่วัน จะเห็นว่าจำวิธีคิดได้จริงหรือแค่จำคำตอบ', 'จับเวลาและพูดอธิบายออกเสียงเหมือนอยู่ในห้องสัมภาษณ์'] },
  '01-06': { title: 'โจทย์ FizzBuzz', summary: 'พิมพ์ 1 ถึง 100 แต่พหุคูณ 3 พิมพ์ Fizz, พหุคูณ 5 พิมพ์ Buzz และพหุคูณทั้งสองพิมพ์ FizzBuzz', points: ['ใช้ % (หารเอาเศษ) เช็กว่าหารลงตัวไหม', 'ต้องเช็กกรณีหารทั้ง 3 และ 5 ลงตัวก่อน ไม่งั้น 15 จะได้แค่ Fizz'], lab: 'fizzbuzz' },
  '01-07': { title: 'Fibonacci แบบ recursion', summary: 'แต่ละตัวในลำดับคือผลบวกของสองตัวก่อนหน้า โค้ดในภาพเรียกตัวเองสองครั้ง', points: ['base case คือ n < 2 ให้คืน n เลย', 'สั้นและอ่านง่าย แต่ช้ามาก (O(2ⁿ)) ดูเหตุผลในหมวด Big O & Fibonacci', 'ภาพเขียนว่าลำดับเริ่มที่ 1, 1 แต่โค้ดนี้ให้ fib(0) = 0, fib(1) = 1'], lab: 'fib' },
  '01-08': { title: 'โจทย์ practical กับ theoretical', summary: 'โจทย์สัมภาษณ์อยู่บนเส้นเดียวกัน ตั้งแต่งานใช้จริงไปจนถึงทฤษฎี', points: ['Practical: ทำ todo app ด้วย React, จัดหน้าด้วย CSS', 'ตรงกลาง: สร้าง promise เอง, ทำ event handler', 'Theoretical: หาจำนวนเฉพาะ, เขียน sorting algorithm'] },
  '01-09': { title: 'ฝึกแต่ละฝั่งอย่างไร', summary: 'วิธีฝึกต่างกันตามชนิดโจทย์', points: ['ฝั่ง practical: เก่งขึ้นจากการสร้างของจริง', 'ตรงกลาง: สร้างของจริงและฝึกแบบตั้งใจ', 'ฝั่ง theoretical: ต้องฝึกแบบตั้งใจ (deliberate practice) คือเลือกจุดอ่อนแล้วฝึกซ้ำ'] },
  '01-10': { title: 'ความยากของเนื้อหา', summary: 'กราฟความยากเทียบเวลา ค่อยๆ ชันขึ้นเป็นช่วง', points: ['ช่วงที่กราฟชัน (เช่น recursion, linked list, tree) เป็นเรื่องปกติที่จะรู้สึกยาก', 'ถ้าติด ให้กลับไปดูภาพประกอบและใช้ Lab เดินทีละขั้น'] },

  // 02 String & Array
  '02-01': { title: 'คำถาม string ที่เจอบ่อย', summary: 'รวม 7 คำถามที่วนมาในการสัมภาษณ์', points: ['มีตัวซ้ำไหม, ตัวไหนเจอบ่อยสุด, เป็น anagram ไหม, เป็น palindrome ไหม', 'กลับ string, กลับลำดับคำ และย่อ string เช่น "bbbccaaaad" → "b3c2a4d1"'] },
  '02-02': { title: 'เทคนิคประจำโจทย์ string', summary: 'สรุปเครื่องมือที่ควรนึกถึงทันทีเมื่อเจอโจทย์แต่ละแบบ', points: ['กลับ string: split แล้ว reverse แล้ว join', 'เช็กตัวซ้ำหรือนับตัวอักษร: เก็บจำนวนไว้ใน object', 'ย่อ string: reduce', 'วนทุกตัวอักษร: for...of ใช้ได้เลย'] },
  '02-03': { title: 'จัดกลุ่มคำถามเป็น 3 แบบ', summary: '7 คำถามข้างต้นแบ่งได้เป็น กลับลำดับ, นับตัวอักษร และย่อ string', points: ['ถ้ารู้ว่าโจทย์อยู่กลุ่มไหน ก็หยิบเทคนิคของกลุ่มนั้นมาใช้ได้เลย', 'anagram, palindrome และ max char เป็นกลุ่มนับตัวอักษรทั้งหมด'] },
  '02-04': { title: 'ภาพซ้ำ', summary: 'ส่วนหนึ่งของภาพก่อนหน้า', hidden: true },
  '02-05': { title: 'นับตัวอักษรด้วย object', summary: 'เก็บตัวอักษรเป็น key และจำนวนครั้งเป็น value', points: ['ช่องว่างและเครื่องหมายก็ถูกนับด้วย', 'ตัวพิมพ์เล็กกับใหญ่นับแยกกัน (H กับ h คนละ key) ถ้าไม่ต้องการให้ toLowerCase() ก่อน'], lab: 'maxchar' },
  '02-06': { title: 'กลับ string แบบใช้ array', summary: '4 ขั้น: แปลงเป็น array → reverse → join กลับเป็น string → return', points: ["เขียนได้บรรทัดเดียว: str.split('').reverse().join('')", 'ผู้สัมภาษณ์มักขอวิธีที่ไม่ใช้ reverse() ต่อ ดูภาพถัดไป'] },
  '02-07': { title: 'กลับ string ด้วย loop', summary: "ลำดับจริงคือ: สร้าง reversed = '' → วนทีละตัว เอาตัวนั้นวางไว้หน้าสุด → คืน reversed", points: ['กล่องในภาพเรียงไม่ตรงลำดับ ให้อ่านตามข้อความนี้', 'อ่านทุกตัวครั้งเดียว จึงเป็น O(n)'], lab: 'reverse' },
  '02-08': { title: 'กลับ string ด้วย reduce', summary: 'reduce สะสมผลไว้ใน acc โดยเอาตัวอักษรใหม่ไว้ข้างหน้าเสมอ', points: ["ค่าเริ่มต้นควรเป็น '' (ว่าง) ในภาพเป็น \" \" ซึ่งจะได้ช่องว่างเกินมาท้ายผลลัพธ์"] },
  '02-09': { title: 'Array.every', summary: 'every คืน true เมื่อทุกตัวผ่านเงื่อนไข และหยุดทันทีที่เจอตัวแรกที่ไม่ผ่าน', points: ['[0, 10, 14].every(v => v > 5) ได้ false เพราะ 0 ไม่ผ่าน'] },
  '02-10': { title: 'Palindrome ด้วย every', summary: 'เทียบตัวที่ i กับตัวที่ length - 1 - i ถ้าเท่ากันทุกคู่ก็เป็น palindrome', points: ['ตัวอย่าง "abcba": index 0 คู่กับ 4, 1 คู่กับ 3', 'every เทียบครบทุกตัว ครึ่งหลังเป็นการเทียบซ้ำ ถ้าใช้ loop หยุดที่ครึ่งเดียวจะเร็วขึ้น'], lab: 'palindrome' },

  // 03 Loop & Recursion
  '03-01': { title: 'กราฟการเติบโตของงาน', summary: 'แกนนอนคือจำนวนข้อมูล แกนตั้งคืองานที่ต้องทำ แต่ละเส้นคือ Big O หนึ่งแบบ', points: ['O(log n) แทบแบนราบ, O(n) เป็นเส้นตรง', 'O(n²) และ O(2ⁿ) พุ่งขึ้นเร็วมาก ข้อมูลมากขึ้นนิดเดียวงานเพิ่มมหาศาล'], lab: 'growth' },
  '03-02': { title: 'Chunk แบบดู chunk สุดท้าย', summary: 'แบ่ง array เป็นกลุ่มละ size ตัว เช่น [1, 2, 3] กับ size 2 ได้ [[1, 2], [3]]', points: ['ดู chunk สุดท้ายใน chunked ถ้ายังไม่มีหรือเต็มแล้ว ให้สร้าง chunk ใหม่', 'ถ้ายังไม่เต็ม ใส่ตัวปัจจุบันเพิ่มเข้าไป'] },
  '03-03': { title: 'Chunk แบบใช้ slice', summary: 'ใช้ index เดินทีละ size แล้ว slice ออกมาทีละช่วง', points: ['slice(index, index + size) ไม่พังถ้าเกินท้าย array แค่คืนเท่าที่มี', 'สั้นกว่าวิธีแรกและอ่านง่ายกว่า'], lab: 'chunk' },
  '03-04': { title: 'Anagram: ตัวอักษรตรงกัน', summary: '"hello" กับ "lleho" สร้าง char map ได้เหมือนกันทุก key จึงเป็น anagram', lab: 'anagram' },
  '03-05': { title: 'Anagram: ตัวอักษรไม่ตรง', summary: '"hello" กับ "hellos" char map ต่างกันที่ s จึงไม่ใช่ anagram', points: ['เทียบจำนวน key ก่อน ถ้าไม่เท่ากันตอบ false ได้ทันที', 'อีกวิธีคือเรียงตัวอักษรทั้งสองข้อความแล้วเทียบ ได้ O(n log n)'], lab: 'anagram' },
  '03-06': { title: 'Debug ด้วย node inspect', summary: 'ขั้นตอนหยุดโค้ดกลางทางเพื่อดูค่าตัวแปร', points: ['ใส่ debugger ในฟังก์ชัน แล้วเรียกฟังก์ชันนั้นในไฟล์', 'รัน node inspect index.js กด c เพื่อไปจุด debugger พิมพ์ repl เพื่อดูค่าตัวแปร', 'ทางเลือกที่สะดวกกว่า: debugger ของ VS Code หรือ node --inspect-brk คู่กับ Chrome DevTools'] },
  '03-07': { title: 'Capitalize ทีละคำ', summary: 'split ด้วยช่องว่าง → ทำตัวแรกของแต่ละคำเป็นตัวใหญ่ + ต่อส่วนที่เหลือ → join กลับ', points: ['word[0].toUpperCase() + word.slice(1)'] },
  '03-08': { title: 'Capitalize ทีละตัวอักษร', summary: 'เริ่ม result ด้วยตัวแรกที่เป็นตัวใหญ่ แล้ววนตัวที่เหลือ ถ้าตัวทางซ้ายเป็นช่องว่างให้ทำเป็นตัวใหญ่', points: ['ไม่ต้อง split/join แต่ต้องระวังเรื่อง index ตัวแรก'] },
  '03-09': { title: 'Steps แบบ loop ซ้อน', summary: 'มองเป็นตาราง n × n: แถวคือ row คอลัมน์คือ column ช่องไหน column ≤ row ให้เติม #', points: ['loop นอกวนแถว loop ในวนคอลัมน์ จบแถวค่อย console.log', 'ตัวอย่าง n = 3 ได้ "#  ", "## ", "###"'], lab: 'steps' },
  '03-10': { title: 'Steps แบบ recursion: ลำดับการเรียก', summary: 'แต่ละ call ส่งต่อ n, row และ stair ที่สร้างไปแล้ว', points: ['steps(4) → steps(4, 0, "#") → … argument เปลี่ยนทุกครั้งเพื่อให้เข้าใกล้ base case'] },
  '03-11': { title: 'Steps แบบ recursion: ทุกกรณี', summary: 'ตัวแปร 3 ตัว: n (แถวทั้งหมด), row (แถวปัจจุบัน), stair (string ของแถวนี้)', points: ['row === n: จบงาน return', 'stair.length === n: จบแถว log แล้วเรียก steps(n, row + 1)', 'ไม่งั้นเติม # หรือช่องว่างแล้วเรียกตัวเองต่อ'] },
  '03-12': { title: 'เคล็ดลับ recursion', summary: '4 ขั้นในการเขียน recursion', points: ['หาข้อมูลน้อยที่สุดที่ต้องใช้แทนปัญหา', 'ตั้งค่า default ให้ argument', 'เช็ก base case ก่อน ถ้าไม่มีงานเหลือให้ return', 'ทำงานหนึ่งส่วน แล้วเรียกตัวเองโดย argument ต้องเปลี่ยน ไม่งั้นวนไม่จบ'] },
  '03-13': { title: 'Steps recursion บนตาราง', summary: 'ภาพเดียวกับ steps แบบ loop แต่เขียนเงื่อนไขแบบ recursion', points: ['row === n คือจบโจทย์', 'stair.length === n คือจบแถว', 'stair.length ≤ row เติม # ไม่งั้นเติมช่องว่าง'] },
  '03-14': { title: 'Pyramid: หาเงื่อนไขของ #', summary: 'โครงเหมือน steps แต่แต่ละแถวกว้าง 2n - 1 และ # อยู่ตรงกลาง', points: ['หา midpoint = Math.floor((2n - 1) / 2)', 'คอลัมน์ไหนอยู่ในช่วง midpoint - row ถึง midpoint + row ให้เติม #'], lab: 'pyramid' },
  '03-15': { title: 'Pyramid: ความกว้างแต่ละแถว', summary: 'n = 2 กว้าง 3, n = 3 กว้าง 5, n = 4 กว้าง 7 จึงได้สูตร 2n - 1', points: ['วงเล็บปีกกาในภาพชี้คอลัมน์กลางที่มี # ทุกแถว'], lab: 'pyramid' },
  '03-16': { title: 'Spiral Matrix: ผลลัพธ์', summary: 'เติมเลข 1 ถึง n² วนตามเข็มนาฬิกาจากนอกเข้าใน', lab: 'matrix' },
  '03-17': { title: 'Spiral Matrix: วิธีเดิน', summary: 'เก็บขอบ 4 ตัว (start/end ของแถวและคอลัมน์) เติมทีละด้านแล้วหดขอบเข้า', points: ['เติมขอบบนจากซ้ายไปขวา แล้ว startRow++', 'เติมขอบขวาจากบนลงล่าง แล้ว endColumn--', 'ทำต่ออีกสองด้าน วนจน start เกิน end'], lab: 'matrix' },

  // 04 Big O & Fibonacci
  '04-01': { title: 'Runtime Complexity คืออะไร', summary: 'บอกว่าถ้าข้อมูลเพิ่มเป็น 2 เท่า อัลกอริทึมต้องทำงานเพิ่มขึ้นแค่ไหน', lab: 'growth' },
  '04-02': { title: 'ตัวอย่าง O(n): กลับ string', summary: 'ตัวอักษรเพิ่ม 1 ตัว งานเพิ่ม 1 รอบ งานโตเป็นเส้นตรงตามข้อมูล', lab: 'growth' },
  '04-03': { title: 'ตัวอย่าง O(n²): steps', summary: 'steps 2 ทำ 4 ช่อง, steps 3 ทำ 9 ช่อง, steps 4 ทำ 16 ช่อง งานเท่ากับ n × n', lab: 'growth' },
  '04-04': { title: 'Big O ที่เจอบ่อย', summary: 'ตารางสรุป 6 แบบจากเร็วไปช้า', points: ['O(1) คงที่ เช่น อ่าน arr[0]', 'O(log n) ข้อมูลเพิ่มเท่าตัวแต่งานไม่เพิ่มเท่าตัว เช่น ค้นหาใน array ที่เรียงแล้ว', 'O(n) วน for จาก 0 ถึง length', 'O(n log n) sorting ที่ดี', 'O(n²) ทุกตัวต้องเทียบกับทุกตัว (handshake problem)', 'O(2ⁿ) ข้อมูลเพิ่ม 1 ตัว งานเพิ่มเท่าตัว'], lab: 'growth' },
  '04-05': { title: 'สัญลักษณ์ Big O', summary: 'เขียน O(...) แทนชื่อเรียก: O(n) = linear, O(1) = constant, O(n²) = quadratic' },
  '04-06': { title: 'วิธีดู Big O จากโค้ด', summary: 'กฎลัดที่ใช้บ่อยในห้องสัมภาษณ์', points: ['loop เดียวบน collection เดียว → O(n) วนแค่ครึ่งก็ยัง O(n) เพราะตัดค่าคงที่ทิ้ง', 'loop แยกบนสอง collection → O(n + m)', 'loop ซ้อนบน collection เดียว → O(n²) บนสอง collection → O(n × m)', 'sorting → O(n log n) ค้นหาใน array ที่เรียงแล้ว → O(log n)'] },
  '04-07': { title: 'Space Complexity', summary: 'ใช้หลักเดียวกับ runtime แต่ถามเรื่องหน่วยความจำ: ข้อมูลเพิ่ม 2 เท่า ต้องใช้ memory เพิ่มแค่ไหน', points: ['เช่น reverse ที่สร้าง string ใหม่ใช้ O(n), bubble sort ที่สลับในที่เดิมใช้ O(1)'] },
  '04-08': { title: 'ลำดับ Fibonacci', summary: '0, 1, 1, 2, 3, 5, 8, 13 แต่ละตัวคือผลบวกสองตัวก่อนหน้า', lab: 'fib' },
  '04-09': { title: 'Base case ของ fib', summary: 'fib(0) = 0 และ fib(1) = 1 คืนค่าทันทีโดยไม่เรียกต่อ', lab: 'fib' },
  '04-10': { title: 'Call tree ของ fib(5)', summary: 'fib(5) เรียกตัวเองรวม 15 ครั้ง และคำนวณค่าเดิมซ้ำ เช่น fib(3) 2 ครั้ง, fib(2) 3 ครั้ง', lab: 'fib' },
  '04-11': { title: 'Call tree ของ fib(6)', summary: 'เพิ่ม n แค่ 1 แต่ call เพิ่มเป็น 25 ครั้ง ต้นไม้ใหญ่ขึ้นเกือบเท่าตัวทุกครั้ง จึงเป็น O(2ⁿ)', lab: 'fib' },
  '04-12': { title: 'งานซ้ำที่ memoization ตัดได้', summary: 'กิ่งที่ซ้ำกันในต้นไม้คือค่าที่เคยคำนวณแล้ว ถ้าจำผลไว้ก็ไม่ต้องคำนวณใหม่', lab: 'memo' },
  '04-13': { title: 'Memoization', summary: 'จำ argument พร้อมผลลัพธ์ของทุก call ถ้าเรียกซ้ำด้วย argument เดิมให้คืนผลที่จำไว้ทันที', lab: 'memo' },
  '04-14': { title: 'Memoizer ห่อฟังก์ชันช้า', summary: 'memoize(slowFib) คืนฟังก์ชันใหม่ที่เร็วขึ้น', points: ['สำคัญ: call ภายในต้องเรียกผ่านตัวที่ memoize แล้ว (fib = memoize(slowFib) และ slowFib เรียก fib) ไม่งั้นได้ cache แค่ชั้นนอกสุด', 'เหลือ O(n) เพราะแต่ละ n คำนวณครั้งเดียว'], lab: 'memo' },

  // 05 Stack & Queue
  '05-01': { title: 'Data Structure คืออะไร', summary: 'วิธีจัดเก็บข้อมูลให้เพิ่ม/ลบได้เร็วตามที่ต้องการ', points: ['JavaScript มี array และ object ให้แล้ว แต่สัมภาษณ์ยังถามโครงสร้างอื่น เช่น queue, stack, linked list'] },
  '05-02': { title: 'Queue ทำได้น้อยกว่า array', summary: 'สิ่งที่ queue ทำได้เป็นเพียงส่วนเล็กๆ ของความสามารถทั้งหมดของ array' },
  '05-03': { title: 'Queue', summary: 'ของเรียงแถวกัน เข้าทางหนึ่ง ออกอีกทางหนึ่ง', lab: 'queue' },
  '05-04': { title: 'ตัวอย่างในชีวิตจริง', summary: 'แถวซื้อตั๋ว คนที่มาถึงก่อนได้ซื้อก่อน', lab: 'queue' },
  '05-05': { title: 'Enqueue / Dequeue', summary: 'enqueue คือเพิ่มเข้าคิว dequeue คือเอาออกจากคิว ทำกันคนละปลาย', lab: 'queue' },
  '05-06': { title: 'First In, First Out', summary: 'A เข้าก่อน B ตอนเอาออก A ออกก่อน (FIFO)', lab: 'queue' },
  '05-07': { title: 'Queue ด้วย array', summary: 'เพิ่มด้วย unshift (หน้า array) เอาออกด้วย pop (ท้าย array)', points: ['unshift ต้องเลื่อนทุกตัวจึงเป็น O(n) ถ้าข้อมูลเยอะควรใช้ linked list แทน'], lab: 'queue' },
  '05-08': { title: 'ทำไมต้องห่อด้วย class', summary: 'Queue class เปิดให้ใช้แค่ add / remove ปิด method อื่นของ array ไว้ คนใช้จะได้ไม่แทรกกลางคิวโดยไม่ตั้งใจ' },
  '05-09': { title: 'Queue API', summary: 'new Queue() สร้างคิว, q.add(1) เพิ่ม, q.remove() เอาตัวที่เข้าก่อนสุดออก', lab: 'queue' },
  '05-10': { title: 'Weave', summary: 'หยิบจากคิว 1 และคิว 2 สลับกันใส่คิวผลลัพธ์: 1, Hi, 2, To, 3, You', lab: 'weave' },
  '05-11': { title: 'Weave เมื่อคิวยาวไม่เท่ากัน', summary: 'คิวไหนหมดก่อนก็ข้ามไป หยิบจากคิวที่เหลือจนหมด', points: ['ใช้ peek() เช็กว่ายังมีของก่อน remove เสมอ'], lab: 'weave' },
  '05-12': { title: 'Stack', summary: 'เพิ่ม (push) และเอาออก (pop) ที่ปลายเดียวกัน เหมือนกองจาน', lab: 'stack' },
  '05-13': { title: 'First In, Last Out', summary: 'A ลงก่อน B ตอนหยิบ B ออกก่อน (FILO หรือ LIFO)', lab: 'stack' },
  '05-14': { title: 'Stack methods', summary: 'push เพิ่มบนสุด, pop หยิบบนสุด, peek ดูบนสุดโดยไม่หยิบ', lab: 'stack' },
  '05-15': { title: 'Queue จาก 2 Stack', summary: 'โจทย์: ใช้ stack สองอันทำงานให้เหมือน queue', lab: 'qfroms' },
  '05-16': { title: 'add ใน Queue จาก Stack', summary: 'add แค่ push ลง Stack A ธรรมดา', lab: 'qfroms' },
  '05-17': { title: 'remove ใน Queue จาก Stack', summary: 'เทของทั้งหมดจาก A ไป B ลำดับจะกลับด้าน ตัวที่เข้าก่อนจึงอยู่บนสุดของ B → pop ออก แล้วเทกลับไป A', lab: 'qfroms' },
  '05-18': { title: 'peek ใน Queue จาก Stack', summary: 'ทำเหมือน remove แต่ใช้ peek ที่ B แทน pop', lab: 'qfroms' },

  // 06 Linked List
  '06-01': { title: 'Linked List', summary: 'ข้อมูลเรียงต่อกันเป็นสาย แต่ละตัวชี้ไปตัวถัดไป ตัวสุดท้ายชี้ null', lab: 'list' },
  '06-02': { title: 'ส่วนประกอบ', summary: 'node = data + reference ไป node ถัดไป ตัวแรกเรียก head ตัวสุดท้ายเรียก tail', lab: 'list' },
  '06-03': { title: 'สร้าง Node', summary: "new Node('Hi') ได้ node ที่ next เป็น null ส่วน new Node('There', n1) ชี้ next ไปหา n1", lab: 'list' },
  '06-04': { title: 'Array ในหน่วยความจำ', summary: 'array เก็บของติดกันในหน่วยความจำ รู้ตำแหน่งตัวแรก และรู้ว่าแต่ละตัวยาวเท่าไร (ในภาพ 5 bytes)' },
  '06-05': { title: 'Array lookup: O(1)', summary: 'หา index 2 คำนวณตรงๆ ได้: 1000 + 2 × 5 = 1010 ไม่ว่า array จะยาวแค่ไหน' },
  '06-06': { title: 'Linked list lookup: O(n)', summary: 'node กระจายอยู่ในหน่วยความจำ ต้องเริ่มที่ head แล้วเดินตาม reference ทีละตัว', lab: 'list' },
  '06-07': { title: 'Array insert: O(n)', summary: 'แทรกกลาง array ต้องเลื่อนทุกตัวที่อยู่หลังจุดแทรก' },
  '06-08': { title: 'Linked list insert: O(1) + เวลาค้นหา', summary: 'แค่เปลี่ยน reference 2 ตัว ไม่ต้องเลื่อนของ แต่ต้องเดินหาตำแหน่งก่อน', lab: 'list' },
  '06-09': { title: 'LinkedList class', summary: 'instance เก็บแค่ head ส่วน node ที่เหลือหาได้จากการเดินตาม next', lab: 'list' },
  '06-10': { title: 'insertFirst', summary: 'สร้าง node ใหม่ให้ next ชี้ head เดิม แล้วตั้ง head เป็น node ใหม่', lab: 'list' },
  '06-11': { title: 'method ที่ใช้ getAt/insertAt/removeAt แทนได้', summary: 'method ชุดใหญ่เขียนใหม่ได้ด้วยไม่กี่ method หลัก', points: ['getFirst = getAt(0), getLast = getAt(size - 1)', 'insertLast ที่ถูกคือ insertAt(data, size()) ในภาพเขียน size() - 1 ซึ่งจะแทรกก่อนตัวสุดท้าย'], lab: 'list' },

  // 07 Linked List Pointers
  '07-01': { title: 'Midpoint ด้วย slow/fast', summary: 'slow เดินทีละ 1 fast ทีละ 2 เมื่อ fast ถึงท้าย slow จะอยู่ตรงกลางพอดี', points: ['ไม่ต้องรู้ขนาด list ล่วงหน้า', 'list ยาวคู่ได้ตัวกลางตัวแรก'], lab: 'midpoint' },
  '07-02': { title: 'ตรวจวงด้วย slow/fast', summary: 'ถ้ามีวง fast จะวิ่งวนมาทัน slow ถ้าไม่มีวง fast จะเจอ null ก่อน', lab: 'circular' },
  '07-03': { title: 'From Last', summary: 'ให้ fast นำไปก่อน n ก้าว แล้วเดินพร้อมกันทีละก้าว เมื่อ fast ถึงตัวสุดท้าย slow จะห่างจากท้าย n ตำแหน่ง', lab: 'fromlast' },

  // 08 Tree & BST
  '08-01': { title: 'Tree', summary: 'ข้อมูลเป็นลำดับชั้น เริ่มจาก root (20) แตกกิ่งลงไป', lab: 'bfs' },
  '08-02': { title: 'Node ของ tree', summary: 'node มี data และ children ที่เป็น array ของ node ลูก', points: ['20 เป็น parent ของ 0'] },
  '08-03': { title: 'Parent / children / siblings', summary: '20 เป็น parent ของ 0, 40 และ -15 ส่วน 12 กับ -2 ที่มี parent เดียวกันเรียก siblings' },
  '08-04': { title: 'Traversal', summary: 'การเดินผ่านทุก node ในต้นไม้ ทำได้หลายลำดับ', lab: 'bfs' },
  '08-05': { title: 'Breadth-First (BFS)', summary: 'เดินทีละชั้นจากซ้ายไปขวา: 20 → 0, 40, -15 → 12, -2, 1, -2', lab: 'bfs' },
  '08-06': { title: 'Depth-First (DFS)', summary: 'ลงลึกสุดก่อนแล้วค่อยถอยกลับ: 20, 0, 12, -2, 1, 40, -15, -2', lab: 'dfs' },
  '08-07': { title: 'add(data)', summary: 'สร้าง node ใหม่แล้ว push เข้า children ของ node ปัจจุบัน' },
  '08-08': { title: 'remove(data)', summary: 'filter children ให้เหลือเฉพาะ node ที่ data ไม่ตรงกับค่าที่จะลบ' },
  '08-09': { title: 'Level Width', summary: "ใช้ BFS กับเครื่องหมาย 's' คั่นท้ายแต่ละชั้น และ counters นับจำนวน node ของชั้นปัจจุบัน", points: ["เจอ 's' แปลว่าจบชั้น ให้เพิ่ม counter ใหม่และใส่ 's' กลับท้าย array"], lab: 'levelwidth' },
  '08-10': { title: 'Tree class', summary: "Tree เก็บ 'root' ไว้ตัวเดียว และมี method traverse สำหรับเดินทั้งต้นไม้", lab: 'bfs' },
  '08-11': { title: 'traverseBF(fn)', summary: 'ส่งฟังก์ชันเข้าไปเรียกกับทุก node ตามลำดับ BFS ในภาพบวก 10 ให้ทุก node', lab: 'bfs' },
  '08-12': { title: 'ใช้ BFS เมื่อไร', summary: 'ผังองค์กรอ่านทีละชั้นตามตำแหน่ง: CEO ก่อน แล้ว CTO, CMO, COO แล้วค่อยระดับ VP', lab: 'bfs' },
  '08-13': { title: 'Binary Search Tree', summary: 'ทุก node มีลูกไม่เกิน 2 และลูกซ้ายน้อยกว่า ลูกขวามากกว่าเสมอ', lab: 'insert' },
  '08-14': { title: 'BST node', summary: 'node มี data, left และ right โดย left.data < data < right.data', lab: 'insert' },
  '08-15': { title: 'insert และ validate', summary: 'insert 15: มากกว่า 10 ไปขวา → มากกว่า 12 ไปขวา → น้อยกว่า 20 ไปซ้าย → น้อยกว่า 17 ไปซ้าย → วางตรงนั้น', points: ['ข้อความ max/min ในภาพใช้กับโจทย์ validate: ทุก node ในกิ่งซ้ายของ 10 ต้องน้อยกว่า 10 (max = 10) ส่งขอบเขตลงไปทุกชั้น'], lab: 'insert' },
  '08-16': { title: 'contains', summary: 'หา 3: น้อยกว่า 10 ไปซ้าย → น้อยกว่า 5 ไปซ้าย → มากกว่า 0 ไปขวา → เจอ 3', points: ['ตัดทิ้งครึ่งหนึ่งทุกก้าวถ้าต้นไม้สมดุล จึงเป็น O(log n) แต่ถ้าเอียงข้างเดียวจะแย่ลงเป็น O(n)'], lab: 'contains' },

  // 09 Events & System Design
  '09-01': { title: 'โครงสร้าง this.events', summary: "object ที่ key เป็นชื่อ event และ value เป็น array ของ callback เช่น 'click' มี 3 callback", lab: 'events' },
  '09-02': { title: 'ออกแบบ Twitter', summary: 'ตัวอย่างคำถาม system design ที่เจอบ่อย ไม่มีคำตอบเดียวที่ถูก' },
  '09-03': { title: 'ข้อควรทำในการตอบ', summary: 'ไม่มีคำตอบที่ถูกตายตัว ผู้สัมภาษณ์แต่ละคนคาดหวังต่างกัน', points: ['เน้นที่ data model', 'อย่าเริ่มจากชื่อเทคโนโลยี ให้อธิบายแนวคิดก่อน', 'วาดภาพ และพูดสิ่งที่คิดตลอด'] },
  '09-04': { title: 'ขั้นตอนตอบ system design', summary: 'เลือก 2 ฟีเจอร์หลัก → เสนอวิธีทำ → หาจุดยาก → อธิบายการ scale' },
  '09-05': { title: 'ร่างหน้าจอเพื่อหาฟีเจอร์', summary: 'วาดหน้า Twitter คร่าวๆ ช่วยให้เห็นฟีเจอร์: tweet, feed, trending, who to follow' },
  '09-06': { title: 'คำถามของแต่ละฟีเจอร์', summary: 'Tweeting: tweet หน้าตาอย่างไรใน DB, ทำ #topic และ @mention อย่างไร, retweet อย่างไร', points: ['Feed: เลือก tweet ที่น่าสนใจขึ้นบนสุดอย่างไร'] },
  '09-07': { title: 'การ scale', summary: 'เมื่อผู้ใช้มากขึ้น ต้องคิดเรื่องรองรับผู้ใช้, caching และวิธี deploy' },
  '09-08': { title: 'Caching', summary: 'server ดูใน memory store ก่อน ถ้ามีข้อมูลของ user ABC แล้วไม่ต้องถาม database ช่วยลดภาระ DB' },
  '09-09': { title: 'Load Balancer', summary: 'กระจาย request จากผู้ใช้ไปหลาย server ที่ใช้ database ร่วมกัน ถ้า server ตัวหนึ่งล่มยังมีตัวอื่นรับงาน' },
  '09-10': { title: 'ช่องทางติดต่อผู้สอน', summary: 'ข้อมูลติดต่อของคอร์สต้นทาง ไม่เกี่ยวกับเนื้อหา', hidden: true },

  // 10 Sorting
  '10-01': { title: 'เทียบ Sorting 3 แบบ', summary: 'ดูว่าแต่ละวิธีช้าที่สุดแค่ไหน และเขียนยากแค่ไหน', points: ['Bubble และ Selection มี loop ซ้อน 2 ชั้น จึงเป็น O(n²)', 'Merge แบ่งครึ่งได้ log n ชั้น แต่ละชั้นรวม n ตัว จึงเป็น O(n log n)', 'Bubble/Selection เรียงในที่เดิม ใช้ memory O(1) ส่วน Merge ใช้ O(n)', 'คอลัมน์ Difficulty คือความยากในการเขียน ไม่ใช่ความเร็ว'] },
  '10-02': { title: 'Bubble Sort', summary: 'เทียบคู่ติดกัน ถ้าซ้ายมากกว่าขวาก็สลับ ทุกรอบตัวมากสุดจะลอยไปท้าย', points: ['loop ใน (j) ต้องหยุดที่ n - i - 1 เพราะอ่าน arr[j + 1] ในภาพย่อว่า (array length - i)', 'ถ้าเพิ่มตัวแปรจำว่ารอบนี้ไม่มีการสลับแล้วหยุดเลย ข้อมูลที่เรียงแล้วจะเหลือ O(n)'], lab: 'bubble' },
  '10-03': { title: 'Selection Sort', summary: 'สมมติว่าตำแหน่ง i น้อยที่สุด ไล่หาตัวที่น้อยกว่าในส่วนที่เหลือ จบรอบสลับครั้งเดียว', points: ['กล่องซ้ายคือสถานะตัวแปรระหว่างทำงาน เช่น i = 1, j = 2, indexOfMin = 1', 'เทียบ n(n-1)/2 ครั้งเสมอ แต่สลับไม่เกิน n - 1 ครั้ง'], lab: 'selection' },
  '10-04': { title: 'Merge Sort: splitter และ merger', summary: 'mergeSort แบ่งครึ่งจนเหลือ 1 ตัว แล้ว merge รวมอาร์เรย์ที่เรียงแล้ว 2 ชุดกลับเป็นชุดเดียว', points: ['merge ดูแค่ตัวแรกของสองฝั่ง ตัวไหนน้อยกว่าก็ shift เข้า results แล้วต่อที่เหลือท้าย', 'โค้ดใช้ < ถ้าค่าเท่ากันจะหยิบฝั่งขวาก่อน ถ้าต้องการ stable ให้ใช้ <='], lab: 'merge' },
  '10-05': { title: 'Merge Sort ทั้งต้นไม้', summary: 'โซนเขียวคือการแบ่ง [97, 0, 22, -30] ลงจนเหลือตัวเดียว โซนน้ำเงินคือการ merge กลับขึ้นเป็น [-30, 0, 22, 97]', points: ['มี log₂ n ชั้น แต่ละชั้น merge รวม n ตัว'], lab: 'merge' },
  '10-06': { title: 'Call stack ของ mergeSort([97, 0])', summary: 'call #1 แบ่งเป็น call #2 = [97] และ call #3 = [0] ทั้งคู่ยาว 1 จึง return ทันที แล้ว call #1 merge ได้ [0, 97]', points: ['call #2 ต้องจบก่อน call #3 จะเริ่ม (depth-first)'], lab: 'merge' },
};
