import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { ChocolateTypeStore, type ChocolateType, type ChocolateTypeData } from './store';
import {
  parseId,
  parseListQuery,
  validateCreate,
  validatePatch,
  type ListQuery,
  type SimulateMode,
  type SortKey,
} from './validation';

const COLLECTION_PATH = '/api/chocolate-types';
const ROUTE = /^\/api\/chocolate-types(?:\/([^/]+))?$/;
const ITEM_METHODS = ['GET', 'PATCH', 'DELETE'];
const RETRY_AFTER = { 'Retry-After': '1' };
const FLAKY_FAILURES = 2;
const MAX_BODY_BYTES = 1024 * 1024;

interface ApiState {
  store: ChocolateTypeStore;
  flakyRequests: number;
  listRequests: number;
  failListRequests: Set<number>;
}

export interface ApiOptions {
  seed?: ChocolateTypeData[];
  // 1-based numbers of GET /api/chocolate-types requests that answer 503 with Retry-After: 0.
  failListRequests?: number[];
}

export interface StartOptions extends ApiOptions {
  port?: number;
  host?: string;
}

interface Failure {
  status: number;
  code: string;
  message: string;
  headers?: Record<string, string>;
}

interface ErrorOptions {
  details?: unknown;
  headers?: Record<string, string>;
}

export function createChocolateApi(options: ApiOptions = {}): Server {
  const state: ApiState = {
    store: new ChocolateTypeStore(options.seed),
    flakyRequests: 0,
    listRequests: 0,
    failListRequests: new Set(options.failListRequests),
  };
  return createServer((req, res) => {
    handleRequest(req, res, state).catch(() => {
      if (res.headersSent) res.end();
      else sendError(res, 500, 'INTERNAL_ERROR', 'Unexpected server error');
    });
  });
}

export function startChocolateApi({
  port = 0,
  host = '127.0.0.1',
  ...apiOptions
}: StartOptions = {}): Promise<{ server: Server; baseUrl: string }> {
  const server = createChocolateApi(apiOptions);
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.off('error', reject);
      const { port: actualPort } = server.address() as AddressInfo;
      resolve({ server, baseUrl: `http://${host}:${actualPort}` });
    });
  });
}

export function stopChocolateApi(server: Server): Promise<void> {
  if (!server.listening) return Promise.resolve();
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
    server.closeAllConnections();
  });
}

async function handleRequest(req: IncomingMessage, res: ServerResponse, state: ApiState): Promise<void> {
  const isClosed = trackClose(res);
  const raw = await readBody(req);
  if (raw === undefined) {
    sendError(res, 413, 'PAYLOAD_TOO_LARGE', `Request body must be at most ${MAX_BODY_BYTES} bytes`);
    return;
  }
  const url = new URL(req.url ?? '/', 'http://localhost');
  const match = ROUTE.exec(url.pathname);
  if (!match) {
    sendError(res, 404, 'ROUTE_NOT_FOUND', `No route for ${url.pathname}`);
    return;
  }
  const method = req.method ?? 'GET';
  const idPart: string | undefined = match[1];
  if (idPart === undefined) {
    if (method === 'GET') return listItems(res, state, url.searchParams, isClosed);
    if (method === 'POST') return createItem(req, res, state, raw);
    return methodNotAllowed(res, ['GET', 'POST']);
  }
  if (!ITEM_METHODS.includes(method)) return methodNotAllowed(res, ITEM_METHODS);
  const id = parseId(idPart);
  if (id === undefined) {
    sendError(res, 400, 'INVALID_ID', 'Chocolate type id must be a positive integer');
    return;
  }
  if (method === 'GET') return getItem(res, state, id);
  if (method === 'PATCH') return patchItem(req, res, state, raw, id);
  return deleteItem(res, state, id);
}

async function listItems(
  res: ServerResponse,
  state: ApiState,
  params: URLSearchParams,
  isClosed: () => boolean,
): Promise<void> {
  state.listRequests += 1;
  if (state.failListRequests.has(state.listRequests)) {
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Injected outage', { headers: { 'Retry-After': '0' } });
    return;
  }
  const parsed = parseListQuery(params);
  if (!parsed.ok) {
    sendError(res, 400, 'INVALID_QUERY', 'Query parameters are invalid', { details: parsed.errors });
    return;
  }
  const query = parsed.value;
  if (query.delay > 0) await sleep(query.delay);
  if (isClosed()) return;
  const failure = query.simulate ? simulateFailure(query.simulate, state) : undefined;
  if (failure) {
    sendError(res, failure.status, failure.code, failure.message, { headers: failure.headers });
    return;
  }
  sendJson(res, 200, buildPage(state.store.list(), query));
}

function getItem(res: ServerResponse, state: ApiState, id: number): void {
  const item = state.store.find(id);
  if (!item) {
    sendNotFound(res, id);
    return;
  }
  sendJson(res, 200, item);
}

function createItem(req: IncomingMessage, res: ServerResponse, state: ApiState, raw: string): void {
  if (rejectNonJson(req, res)) return;
  const body = parseJson(raw);
  if (!body.ok) {
    sendError(res, 400, 'INVALID_JSON', 'Request body must be valid JSON');
    return;
  }
  const input = validateCreate(body.value);
  if (!input.ok) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Request body is invalid', { details: input.errors });
    return;
  }
  if (state.store.isNameTaken(input.value.name)) {
    sendError(res, 409, 'DUPLICATE_NAME', `A chocolate type named "${input.value.name}" already exists`);
    return;
  }
  const created = state.store.create(input.value);
  sendJson(res, 201, created, { Location: `${COLLECTION_PATH}/${created.id}` });
}

function patchItem(req: IncomingMessage, res: ServerResponse, state: ApiState, raw: string, id: number): void {
  if (rejectNonJson(req, res)) return;
  const body = parseJson(raw);
  if (!body.ok) {
    sendError(res, 400, 'INVALID_JSON', 'Request body must be valid JSON');
    return;
  }
  const patch = validatePatch(body.value);
  if (!patch.ok) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Request body is invalid', { details: patch.errors });
    return;
  }
  if (state.store.find(id) === undefined) {
    sendNotFound(res, id);
    return;
  }
  if (patch.value.name !== undefined && state.store.isNameTaken(patch.value.name, id)) {
    sendError(res, 409, 'DUPLICATE_NAME', `A chocolate type named "${patch.value.name}" already exists`);
    return;
  }
  sendJson(res, 200, state.store.update(id, patch.value));
}

function deleteItem(res: ServerResponse, state: ApiState, id: number): void {
  if (!state.store.remove(id)) {
    sendNotFound(res, id);
    return;
  }
  res.writeHead(204);
  res.end();
}

function buildPage(items: ChocolateType[], query: ListQuery) {
  const matching = items
    .filter((item) => query.category === undefined || item.category === query.category)
    .filter((item) => query.minCacao === undefined || item.cacaoPercent >= query.minCacao)
    .sort(comparatorFor(query.sort));
  const start = (query.page - 1) * query.pageSize;
  return {
    data: matching.slice(start, start + query.pageSize),
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total: matching.length,
      totalPages: Math.ceil(matching.length / query.pageSize),
    },
  };
}

function comparatorFor(sort: SortKey): (a: ChocolateType, b: ChocolateType) => number {
  const descending = sort.startsWith('-');
  const field = descending ? sort.slice(1) : sort;
  return (a, b) => {
    const diff =
      field === 'name'
        ? compareNames(a.name, b.name)
        : field === 'cacaoPercent'
          ? a.cacaoPercent - b.cacaoPercent
          : a.id - b.id;
    return (descending ? -diff : diff) || a.id - b.id;
  };
}

function compareNames(a: string, b: string): number {
  const left = a.toLowerCase();
  const right = b.toLowerCase();
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function simulateFailure(mode: SimulateMode, state: ApiState): Failure | undefined {
  switch (mode) {
    case '429':
      return { status: 429, code: 'RATE_LIMITED', message: 'Simulated rate limit', headers: RETRY_AFTER };
    case '500':
      return { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    case '503':
      return { status: 503, code: 'SERVICE_UNAVAILABLE', message: 'Simulated outage', headers: RETRY_AFTER };
    case 'flaky':
      state.flakyRequests += 1;
      return state.flakyRequests <= FLAKY_FAILURES
        ? { status: 503, code: 'SERVICE_UNAVAILABLE', message: 'Simulated intermittent outage', headers: RETRY_AFTER }
        : undefined;
  }
}

function trackClose(res: ServerResponse): () => boolean {
  let closed = false;
  res.once('close', () => {
    closed = true;
  });
  return () => closed;
}

// Resolves undefined when the body is too large. Oversized bodies are drained, not buffered.
function readBody(req: IncomingMessage): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size <= MAX_BODY_BYTES) chunks.push(chunk);
    });
    req.on('end', () => resolve(size > MAX_BODY_BYTES ? undefined : Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function isJsonRequest(req: IncomingMessage): boolean {
  const mediaType = req.headers['content-type']?.split(';')[0]?.trim().toLowerCase();
  return mediaType === 'application/json';
}

function rejectNonJson(req: IncomingMessage, res: ServerResponse): boolean {
  if (isJsonRequest(req)) return false;
  sendError(res, 415, 'UNSUPPORTED_MEDIA_TYPE', 'Content-Type must be application/json');
  return true;
}

function parseJson(raw: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms).unref();
  });
}

function sendNotFound(res: ServerResponse, id: number): void {
  sendError(res, 404, 'NOT_FOUND', `Chocolate type ${id} was not found`);
}

function methodNotAllowed(res: ServerResponse, allowed: string[]): void {
  sendError(res, 405, 'METHOD_NOT_ALLOWED', `Method not allowed; use ${allowed.join(', ')}`, {
    headers: { Allow: allowed.join(', ') },
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown, headers: Record<string, string> = {}): void {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
}

function sendError(
  res: ServerResponse,
  status: number,
  code: string,
  message: string,
  options: ErrorOptions = {},
): void {
  const error = options.details === undefined ? { code, message } : { code, message, details: options.details };
  sendJson(res, status, { error }, options.headers);
}
