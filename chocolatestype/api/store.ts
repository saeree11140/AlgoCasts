export const CATEGORIES = ['dark', 'milk', 'white', 'ruby'] as const;

export type ChocolateCategory = (typeof CATEGORIES)[number];

export interface ChocolateType {
  id: number;
  name: string;
  category: ChocolateCategory;
  cacaoPercent: number;
  sugarFree: boolean;
}

export type ChocolateTypeData = Omit<ChocolateType, 'id'>;

const SEED_DATA: ChocolateTypeData[] = [
  { name: 'Dark 70', category: 'dark', cacaoPercent: 70, sugarFree: false },
  { name: 'Milk Classic', category: 'milk', cacaoPercent: 35, sugarFree: false },
  { name: 'White Vanilla', category: 'white', cacaoPercent: 0, sugarFree: false },
  { name: 'Ruby Berry', category: 'ruby', cacaoPercent: 47, sugarFree: true },
  { name: 'Dark 100 Pure', category: 'dark', cacaoPercent: 100, sugarFree: true },
];

export function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export class ChocolateTypeStore {
  private readonly items = new Map<number, ChocolateType>();
  private nextId = 1;

  constructor(seed: ChocolateTypeData[] = SEED_DATA) {
    seed.forEach((data) => this.create(data));
  }

  // Callers always get copies so they cannot change stored items by accident.
  list(): ChocolateType[] {
    return [...this.items.values()].map((item) => ({ ...item }));
  }

  find(id: number): ChocolateType | undefined {
    const item = this.items.get(id);
    return item && { ...item };
  }

  create(data: ChocolateTypeData): ChocolateType {
    const item: ChocolateType = { id: this.nextId, ...data };
    this.nextId += 1;
    this.items.set(item.id, item);
    return { ...item };
  }

  update(id: number, patch: Partial<ChocolateTypeData>): ChocolateType | undefined {
    const current = this.items.get(id);
    if (!current) return undefined;
    const updated: ChocolateType = { ...current, ...patch, id };
    this.items.set(id, updated);
    return { ...updated };
  }

  remove(id: number): boolean {
    return this.items.delete(id);
  }

  isNameTaken(name: string, exceptId?: number): boolean {
    const key = normalizeName(name);
    return [...this.items.values()].some((item) => item.id !== exceptId && normalizeName(item.name) === key);
  }
}
