import { CATEGORIES, type ChocolateCategory, type ChocolateTypeData } from './store';

export interface FieldError {
  field: string;
  message: string;
}

export type Result<T> = { ok: true; value: T } | { ok: false; errors: FieldError[] };

export const SORT_KEYS = ['id', 'name', '-name', 'cacaoPercent', '-cacaoPercent'] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const SIMULATE_MODES = ['429', '500', '503', 'flaky'] as const;
export type SimulateMode = (typeof SIMULATE_MODES)[number];

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;
export const MAX_DELAY_MS = 5000;

const NAME_MAX_LENGTH = 50;
const EDITABLE_FIELDS = ['name', 'category', 'cacaoPercent', 'sugarFree'];

export interface ListQuery {
  category?: ChocolateCategory;
  minCacao?: number;
  sort: SortKey;
  page: number;
  pageSize: number;
  delay: number;
  simulate?: SimulateMode;
}

export type Patch = Partial<ChocolateTypeData>;

type FieldResult<T> = { value: T } | { message: string };

function isOneOf<T extends string>(options: readonly T[], value: string): value is T {
  return (options as readonly string[]).includes(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function notAnObject<T>(): Result<T> {
  return { ok: false, errors: [{ field: 'body', message: 'must be a JSON object' }] };
}

function readChoice<T extends string>(
  params: URLSearchParams,
  field: string,
  options: readonly T[],
  errors: FieldError[],
): T | undefined {
  const raw = params.get(field);
  if (raw === null) return undefined;
  if (isOneOf(options, raw)) return raw;
  errors.push({ field, message: `must be one of: ${options.join(', ')}` });
  return undefined;
}

function readInteger(
  params: URLSearchParams,
  field: string,
  min: number,
  max: number,
  errors: FieldError[],
): number | undefined {
  const raw = params.get(field);
  if (raw === null) return undefined;
  const value = /^-?\d+$/.test(raw) ? Number(raw) : Number.NaN;
  if (Number.isSafeInteger(value) && value >= min && value <= max) return value;
  errors.push({ field, message: `must be an integer from ${min} to ${max}` });
  return undefined;
}

export function parseListQuery(params: URLSearchParams): Result<ListQuery> {
  const errors: FieldError[] = [];
  const category = readChoice(params, 'category', CATEGORIES, errors);
  const sort = readChoice(params, 'sort', SORT_KEYS, errors) ?? 'id';
  const simulate = readChoice(params, 'simulate', SIMULATE_MODES, errors);
  const minCacao = readInteger(params, 'minCacao', 0, 100, errors);
  const page = readInteger(params, 'page', 1, Number.MAX_SAFE_INTEGER, errors) ?? 1;
  const pageSize = readInteger(params, 'pageSize', 1, MAX_PAGE_SIZE, errors) ?? DEFAULT_PAGE_SIZE;
  const delay = readInteger(params, 'delay', 0, MAX_DELAY_MS, errors) ?? 0;
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: { category, minCacao, sort, page, pageSize, delay, simulate } };
}

function checkName(value: unknown): FieldResult<string> {
  if (typeof value !== 'string') return { message: 'must be a string' };
  const name = value.trim();
  if (name.length === 0) return { message: 'must not be blank' };
  if (name.length > NAME_MAX_LENGTH) return { message: `must be at most ${NAME_MAX_LENGTH} characters` };
  return { value: name };
}

function checkCategory(value: unknown): FieldResult<ChocolateCategory> {
  if (typeof value === 'string' && isOneOf(CATEGORIES, value)) return { value };
  return { message: `must be one of: ${CATEGORIES.join(', ')}` };
}

function checkCacaoPercent(value: unknown): FieldResult<number> {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100) return { value };
  return { message: 'must be an integer from 0 to 100' };
}

function checkSugarFree(value: unknown): FieldResult<boolean> {
  if (typeof value === 'boolean') return { value };
  return { message: 'must be true or false' };
}

function readField<T>(
  body: Record<string, unknown>,
  field: string,
  check: (value: unknown) => FieldResult<T>,
  errors: FieldError[],
): T | undefined {
  if (!Object.hasOwn(body, field)) return undefined;
  const result = check(body[field]);
  if ('message' in result) {
    errors.push({ field, message: result.message });
    return undefined;
  }
  return result.value;
}

export function validateCreate(body: unknown): Result<ChocolateTypeData> {
  if (!isObject(body)) return notAnObject();
  const errors: FieldError[] = [];
  for (const field of ['name', 'category', 'cacaoPercent']) {
    if (!Object.hasOwn(body, field)) errors.push({ field, message: 'is required' });
  }
  const name = readField(body, 'name', checkName, errors);
  const category = readField(body, 'category', checkCategory, errors);
  const cacaoPercent = readField(body, 'cacaoPercent', checkCacaoPercent, errors);
  const sugarFree = readField(body, 'sugarFree', checkSugarFree, errors) ?? false;
  if (errors.length > 0 || name === undefined || category === undefined || cacaoPercent === undefined) {
    return { ok: false, errors };
  }
  return { ok: true, value: { name, category, cacaoPercent, sugarFree } };
}

export function validatePatch(body: unknown): Result<Patch> {
  if (!isObject(body)) return notAnObject();
  const errors: FieldError[] = [];
  const name = readField(body, 'name', checkName, errors);
  const category = readField(body, 'category', checkCategory, errors);
  const cacaoPercent = readField(body, 'cacaoPercent', checkCacaoPercent, errors);
  const sugarFree = readField(body, 'sugarFree', checkSugarFree, errors);
  if (!EDITABLE_FIELDS.some((field) => Object.hasOwn(body, field))) {
    errors.push({ field: 'body', message: `must include at least one of: ${EDITABLE_FIELDS.join(', ')}` });
  }
  if (errors.length > 0) return { ok: false, errors };
  const patch: Patch = {};
  if (name !== undefined) patch.name = name;
  if (category !== undefined) patch.category = category;
  if (cacaoPercent !== undefined) patch.cacaoPercent = cacaoPercent;
  if (sugarFree !== undefined) patch.sugarFree = sugarFree;
  return { ok: true, value: patch };
}

export function parseId(raw: string): number | undefined {
  if (!/^\d+$/.test(raw)) return undefined;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id >= 1 ? id : undefined;
}
