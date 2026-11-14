// --- Directions
// เขียน chocolateReport(baseUrl, minCacao) ให้ดึงประเภทช็อกโกแลตที่มี
// cacaoPercent >= minCacao จาก GET {baseUrl}/api/chocolate-types ให้ครบทุกหน้า
// แล้วสรุปแยกตาม category เป็น { count, avgCacao, strongest }
// - avgCacao ปัดเป็นทศนิยม 2 ตำแหน่ง
// - strongest คือ name ของรายการที่ cacaoPercent สูงสุด ถ้าเท่ากันเลือก id น้อยที่สุด
// - category ที่ไม่มีรายการ ห้ามใส่ใน object ผลลัพธ์
// - ถ้าได้ 503 ให้ลองใหม่ได้ไม่เกิน 3 ครั้งต่อ request, error อื่นให้ throw ทันที
// กติกาและ constraints ทั้งหมดอยู่ที่ ../README.md
// --- Examples (ข้อมูลเริ่มต้นของ mock API)
//   chocolateReport(baseUrl, 50) --> { dark: { count: 2, avgCacao: 85, strongest: 'Dark 100 Pure' } }
//   chocolateReport(baseUrl, 0)  --> { dark: {...}, milk: {...}, white: {...}, ruby: {...} }

export type ChocolateCategory = "dark" | "milk" | "white" | "ruby";

export interface CategoryReport {
  count: number;
  avgCacao: number;
  strongest: string;
}

export type ChocolateReport = Partial<
  Record<ChocolateCategory, CategoryReport>
>;

export async function chocolateReport(
  baseUrl: string,
  minCacao: number,
): Promise<ChocolateReport> {
  console.log("Fetching chocolate report with minCacao:", minCacao);
  throw new Error("TODO: chocolateReport");
}
