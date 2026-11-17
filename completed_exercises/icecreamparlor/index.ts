// --- Directions
// cost[i] คือราคาไอศกรีมรสที่ i สองคนมีเงินรวม money และต้องใช้เงินให้หมดพอดี
// เลือกไอศกรีม 2 รส (คนละตำแหน่ง) ที่ราคารวมเท่ากับ money
// คืนเลขรสเป็นแบบนับจาก 1 เรียงจากน้อยไปมาก รับประกันว่ามีคำตอบเดียว
// ราคาอาจซ้ำกันได้ เช่นสองรสราคาเท่ากัน
// อ้างอิงรูปแบบโจทย์ HackerRank: Hash Tables: Ice Cream Parlor
// --- Examples
//   whatFlavors([1, 4, 5, 3, 2], 4) --> [1, 4]   (ราคา 1 + 3)
//   whatFlavors([2, 2, 4, 3], 4) --> [1, 2]      (ราคา 2 + 2)

function whatFlavors(cost: number[], money: number): number[] {
  // price -> index where that price was first seen
  const seen = new Map<number, number>();

  for (let i = 0; i < cost.length; i++) {
    const partner = money - cost[i];

    if (seen.has(partner)) {
      return [seen.get(partner)! + 1, i + 1];
    }

    if (!seen.has(cost[i])) {
      seen.set(cost[i], i);
    }
  }

  return [];
}

export = whatFlavors;
