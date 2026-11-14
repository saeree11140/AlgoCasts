import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { startChocolateApi, stopChocolateApi } from './index';
import { ChocolateTypeStore } from './store';

interface Reply {
  status: number;
  headers: Headers;
  body: any;
}

interface RequestOptions {
  json?: unknown;
  raw?: string;
  contentType?: string;
}

let server: Server;
let base: string;

beforeEach(async () => {
  ({ server, baseUrl: base } = await startChocolateApi());
});

afterEach(() => stopChocolateApi(server));

async function call(method: string, path: string, options: RequestOptions = {}): Promise<Reply> {
  const headers: Record<string, string> = {};
  let body: string | undefined;
  if (options.raw !== undefined) body = options.raw;
  else if (options.json !== undefined) body = JSON.stringify(options.json);
  if (body !== undefined) headers['content-type'] = options.contentType ?? 'application/json';
  const response = await fetch(`${base}${path}`, { method, headers, body });
  const text = await response.text();
  return { status: response.status, headers: response.headers, body: text === '' ? undefined : JSON.parse(text) };
}

const VALID_NEW = { name: 'Mint Dark', category: 'dark', cacaoPercent: 60 };
const ids = (items: Array<{ id: number }>): number[] => items.map((item) => item.id);
const detailFields = (reply: Reply): string[] =>
  reply.body.error.details.map((detail: { field: string }) => detail.field).sort();

describe('GET /api/chocolate-types', () => {
  it('returns the seeded items with pagination metadata', async () => {
    const reply = await call('GET', '/api/chocolate-types');
    assert.equal(reply.status, 200);
    assert.match(reply.headers.get('content-type') ?? '', /^application\/json/);
    assert.deepEqual(ids(reply.body.data), [1, 2, 3, 4, 5]);
    assert.deepEqual(reply.body.meta, { page: 1, pageSize: 10, total: 5, totalPages: 1 });
  });

  it('filters by category', async () => {
    const reply = await call('GET', '/api/chocolate-types?category=dark');
    assert.deepEqual(ids(reply.body.data), [1, 5]);
    assert.equal(reply.body.meta.total, 2);
  });

  it('filters by minCacao with an inclusive boundary', async () => {
    const reply = await call('GET', '/api/chocolate-types?minCacao=70');
    assert.deepEqual(ids(reply.body.data), [1, 5]);
  });

  it('combines category and minCacao filters', async () => {
    const reply = await call('GET', '/api/chocolate-types?category=dark&minCacao=80');
    assert.deepEqual(ids(reply.body.data), [5]);
  });

  it('sorts by cacaoPercent descending', async () => {
    const reply = await call('GET', '/api/chocolate-types?sort=-cacaoPercent');
    assert.deepEqual(ids(reply.body.data), [5, 1, 4, 2, 3]);
  });

  it('breaks sort ties by ascending id', async () => {
    await call('POST', '/api/chocolate-types', { json: { name: 'Dark 70 Intense', category: 'dark', cacaoPercent: 70 } });
    const reply = await call('GET', '/api/chocolate-types?sort=-cacaoPercent');
    assert.deepEqual(ids(reply.body.data), [5, 1, 6, 4, 2, 3]);
  });

  it('sorts names case-insensitively in both directions', async () => {
    await call('POST', '/api/chocolate-types', { json: { name: 'almond Crunch', category: 'milk', cacaoPercent: 40 } });
    const ascending = await call('GET', '/api/chocolate-types?sort=name');
    assert.deepEqual(ids(ascending.body.data), [6, 5, 1, 2, 4, 3]);
    const descending = await call('GET', '/api/chocolate-types?sort=-name');
    assert.deepEqual(ids(descending.body.data), [3, 4, 2, 1, 5, 6]);
  });

  it('paginates with page and pageSize', async () => {
    const reply = await call('GET', '/api/chocolate-types?page=2&pageSize=2');
    assert.deepEqual(ids(reply.body.data), [3, 4]);
    assert.deepEqual(reply.body.meta, { page: 2, pageSize: 2, total: 5, totalPages: 3 });
  });

  it('returns an empty data array for a page past the end', async () => {
    const reply = await call('GET', '/api/chocolate-types?page=4&pageSize=2');
    assert.equal(reply.status, 200);
    assert.deepEqual(reply.body.data, []);
    assert.equal(reply.body.meta.totalPages, 3);
  });

  it('returns zero total and zero pages when nothing matches', async () => {
    const reply = await call('GET', '/api/chocolate-types?category=white&minCacao=1');
    assert.equal(reply.status, 200);
    assert.deepEqual(reply.body, { data: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } });
  });

  it('ignores unknown query parameters', async () => {
    const reply = await call('GET', '/api/chocolate-types?foo=bar');
    assert.equal(reply.status, 200);
    assert.equal(reply.body.meta.total, 5);
  });

  it('waits for the requested delay before responding', async () => {
    const started = Date.now();
    const reply = await call('GET', '/api/chocolate-types?delay=150');
    assert.equal(reply.status, 200);
    assert.ok(Date.now() - started >= 140);
  });

  it('returns 500 INTERNAL_ERROR for simulate=500', async () => {
    const reply = await call('GET', '/api/chocolate-types?simulate=500');
    assert.equal(reply.status, 500);
    assert.equal(reply.body.error.code, 'INTERNAL_ERROR');
  });

  for (const [mode, status, code] of [
    ['503', 503, 'SERVICE_UNAVAILABLE'],
    ['429', 429, 'RATE_LIMITED'],
  ] as const) {
    it(`returns ${status} with Retry-After for simulate=${mode}`, async () => {
      const reply = await call('GET', `/api/chocolate-types?simulate=${mode}`);
      assert.equal(reply.status, status);
      assert.equal(reply.body.error.code, code);
      assert.equal(reply.headers.get('retry-after'), '1');
    });
  }

  it('fails twice and then succeeds for simulate=flaky', async () => {
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 3; attempt += 1) {
      statuses.push((await call('GET', '/api/chocolate-types?simulate=flaky')).status);
    }
    assert.deepEqual(statuses, [503, 503, 200]);
  });

  const invalidQueries = [
    'page=0',
    'page=1.5',
    'page=abc',
    'pageSize=0',
    'pageSize=51',
    'minCacao=101',
    'minCacao=-1',
    'minCacao=',
    'category=caramel',
    'sort=price',
    'delay=5001',
    'simulate=404',
  ];
  for (const query of invalidQueries) {
    it(`rejects ${query} with 400 INVALID_QUERY`, async () => {
      const reply = await call('GET', `/api/chocolate-types?${query}`);
      assert.equal(reply.status, 400);
      assert.equal(reply.body.error.code, 'INVALID_QUERY');
      assert.equal(reply.body.error.details.length, 1);
    });
  }

  it('reports every invalid query parameter at once', async () => {
    const reply = await call('GET', '/api/chocolate-types?category=caramel&pageSize=0&sort=price');
    assert.deepEqual(detailFields(reply), ['category', 'pageSize', 'sort']);
  });
});

describe('GET /api/chocolate-types/:id', () => {
  it('returns one chocolate type', async () => {
    const reply = await call('GET', '/api/chocolate-types/1');
    assert.equal(reply.status, 200);
    assert.deepEqual(reply.body, { id: 1, name: 'Dark 70', category: 'dark', cacaoPercent: 70, sugarFree: false });
  });

  it('returns 404 NOT_FOUND for an unknown id', async () => {
    const reply = await call('GET', '/api/chocolate-types/999');
    assert.equal(reply.status, 404);
    assert.equal(reply.body.error.code, 'NOT_FOUND');
  });

  for (const id of ['0', '-1', '1.5', 'abc', '1e2']) {
    it(`returns 400 INVALID_ID for id ${id}`, async () => {
      const reply = await call('GET', `/api/chocolate-types/${id}`);
      assert.equal(reply.status, 400);
      assert.equal(reply.body.error.code, 'INVALID_ID');
    });
  }
});

describe('POST /api/chocolate-types', () => {
  it('creates an item with 201, a Location header and sugarFree defaulting to false', async () => {
    const reply = await call('POST', '/api/chocolate-types', { json: VALID_NEW });
    assert.equal(reply.status, 201);
    assert.equal(reply.headers.get('location'), '/api/chocolate-types/6');
    assert.deepEqual(reply.body, { id: 6, name: 'Mint Dark', category: 'dark', cacaoPercent: 60, sugarFree: false });
    const fetched = await call('GET', '/api/chocolate-types/6');
    assert.deepEqual(fetched.body, reply.body);
  });

  it('trims the name before saving', async () => {
    const reply = await call('POST', '/api/chocolate-types', { json: { ...VALID_NEW, name: '  Mint Dark  ' } });
    assert.equal(reply.body.name, 'Mint Dark');
  });

  it('ignores an id sent by the client', async () => {
    const reply = await call('POST', '/api/chocolate-types', { json: { ...VALID_NEW, id: 999 } });
    assert.equal(reply.body.id, 6);
  });

  it('accepts boundary values for name length and cacaoPercent', async () => {
    const low = await call('POST', '/api/chocolate-types', { json: { name: 'x'.repeat(50), category: 'white', cacaoPercent: 0 } });
    const high = await call('POST', '/api/chocolate-types', { json: { name: 'y'.repeat(50), category: 'dark', cacaoPercent: 100 } });
    assert.equal(low.status, 201);
    assert.equal(high.status, 201);
  });

  const invalidNames: Array<[string, unknown]> = [
    ['a blank name', '   '],
    ['an empty name', ''],
    ['a name longer than 50 characters', 'x'.repeat(51)],
    ['a non-string name', 42],
  ];
  for (const [label, name] of invalidNames) {
    it(`rejects ${label}`, async () => {
      const reply = await call('POST', '/api/chocolate-types', { json: { ...VALID_NEW, name } });
      assert.equal(reply.status, 400);
      assert.equal(reply.body.error.code, 'VALIDATION_ERROR');
      assert.deepEqual(detailFields(reply), ['name']);
    });
  }

  const invalidFields: Array<[string, Record<string, unknown>, string]> = [
    ['an unknown category', { category: 'caramel' }, 'category'],
    ['cacaoPercent above 100', { cacaoPercent: 101 }, 'cacaoPercent'],
    ['negative cacaoPercent', { cacaoPercent: -1 }, 'cacaoPercent'],
    ['fractional cacaoPercent', { cacaoPercent: 70.5 }, 'cacaoPercent'],
    ['cacaoPercent sent as a string', { cacaoPercent: '70' }, 'cacaoPercent'],
    ['null cacaoPercent', { cacaoPercent: null }, 'cacaoPercent'],
    ['non-boolean sugarFree', { sugarFree: 'yes' }, 'sugarFree'],
  ];
  for (const [label, override, field] of invalidFields) {
    it(`rejects ${label}`, async () => {
      const reply = await call('POST', '/api/chocolate-types', { json: { ...VALID_NEW, ...override } });
      assert.equal(reply.status, 400);
      assert.deepEqual(detailFields(reply), [field]);
    });
  }

  it('reports every missing required field in one response', async () => {
    const reply = await call('POST', '/api/chocolate-types', { json: {} });
    assert.equal(reply.status, 400);
    assert.deepEqual(detailFields(reply), ['cacaoPercent', 'category', 'name']);
  });

  const nonObjects: Array<[string, unknown]> = [
    ['an array', [1, 2]],
    ['a string', 'text'],
    ['null', null],
  ];
  for (const [label, json] of nonObjects) {
    it(`rejects a JSON body that is ${label}`, async () => {
      const reply = await call('POST', '/api/chocolate-types', { json });
      assert.equal(reply.status, 400);
      assert.deepEqual(detailFields(reply), ['body']);
    });
  }

  it('rejects malformed JSON with INVALID_JSON', async () => {
    const reply = await call('POST', '/api/chocolate-types', { raw: '{"name": ' });
    assert.equal(reply.status, 400);
    assert.equal(reply.body.error.code, 'INVALID_JSON');
  });

  it('rejects an empty body with INVALID_JSON', async () => {
    const reply = await call('POST', '/api/chocolate-types', { raw: '' });
    assert.equal(reply.status, 400);
    assert.equal(reply.body.error.code, 'INVALID_JSON');
  });

  it('requires a JSON Content-Type header', async () => {
    const reply = await call('POST', '/api/chocolate-types', { raw: JSON.stringify(VALID_NEW), contentType: 'text/plain' });
    assert.equal(reply.status, 415);
    assert.equal(reply.body.error.code, 'UNSUPPORTED_MEDIA_TYPE');
  });

  it('rejects a body larger than 1 MB with 413 PAYLOAD_TOO_LARGE', async () => {
    const reply = await call('POST', '/api/chocolate-types', { raw: 'x'.repeat(1024 * 1024 + 1) });
    assert.equal(reply.status, 413);
    assert.equal(reply.body.error.code, 'PAYLOAD_TOO_LARGE');
  });

  it('rejects a duplicate name case-insensitively and ignoring surrounding spaces', async () => {
    const reply = await call('POST', '/api/chocolate-types', { json: { ...VALID_NEW, name: '  dark 70 ' } });
    assert.equal(reply.status, 409);
    assert.equal(reply.body.error.code, 'DUPLICATE_NAME');
  });

  it('never reuses the id of a deleted item', async () => {
    const first = await call('POST', '/api/chocolate-types', { json: VALID_NEW });
    await call('DELETE', `/api/chocolate-types/${first.body.id}`);
    const second = await call('POST', '/api/chocolate-types', { json: { ...VALID_NEW, name: 'Another' } });
    assert.equal(first.body.id, 6);
    assert.equal(second.body.id, 7);
  });
});

describe('PATCH /api/chocolate-types/:id', () => {
  it('updates only the supplied fields', async () => {
    const reply = await call('PATCH', '/api/chocolate-types/1', { json: { cacaoPercent: 80 } });
    assert.equal(reply.status, 200);
    assert.deepEqual(reply.body, { id: 1, name: 'Dark 70', category: 'dark', cacaoPercent: 80, sugarFree: false });
  });

  it('lets an item keep its own name with different casing', async () => {
    const reply = await call('PATCH', '/api/chocolate-types/1', { json: { name: 'DARK 70' } });
    assert.equal(reply.status, 200);
    assert.equal(reply.body.name, 'DARK 70');
  });

  it('rejects renaming an item to the name of another item', async () => {
    const reply = await call('PATCH', '/api/chocolate-types/2', { json: { name: 'dark 70' } });
    assert.equal(reply.status, 409);
    assert.equal(reply.body.error.code, 'DUPLICATE_NAME');
  });

  it('returns 404 NOT_FOUND for an unknown id', async () => {
    const reply = await call('PATCH', '/api/chocolate-types/999', { json: { name: 'New Name' } });
    assert.equal(reply.status, 404);
    assert.equal(reply.body.error.code, 'NOT_FOUND');
  });

  it('validates the body before checking that the id exists', async () => {
    const reply = await call('PATCH', '/api/chocolate-types/999', { json: { cacaoPercent: 200 } });
    assert.equal(reply.status, 400);
    assert.equal(reply.body.error.code, 'VALIDATION_ERROR');
  });

  it('rejects an empty object', async () => {
    const reply = await call('PATCH', '/api/chocolate-types/1', { json: {} });
    assert.equal(reply.status, 400);
    assert.deepEqual(detailFields(reply), ['body']);
  });

  it('rejects a body without any editable field', async () => {
    const reply = await call('PATCH', '/api/chocolate-types/1', { json: { id: 2 } });
    assert.equal(reply.status, 400);
    assert.deepEqual(detailFields(reply), ['body']);
  });

  it('rejects null for a non-nullable field', async () => {
    const reply = await call('PATCH', '/api/chocolate-types/1', { json: { sugarFree: null } });
    assert.equal(reply.status, 400);
    assert.deepEqual(detailFields(reply), ['sugarFree']);
  });

  it('returns 400 INVALID_ID for a non-numeric id', async () => {
    const reply = await call('PATCH', '/api/chocolate-types/abc', { json: { name: 'Anything' } });
    assert.equal(reply.status, 400);
    assert.equal(reply.body.error.code, 'INVALID_ID');
  });

  it('requires a JSON Content-Type header', async () => {
    const reply = await call('PATCH', '/api/chocolate-types/1', { raw: '{"name":"X"}', contentType: 'text/plain' });
    assert.equal(reply.status, 415);
    assert.equal(reply.body.error.code, 'UNSUPPORTED_MEDIA_TYPE');
  });

  it('rejects malformed JSON with INVALID_JSON', async () => {
    const reply = await call('PATCH', '/api/chocolate-types/1', { raw: '{' });
    assert.equal(reply.status, 400);
    assert.equal(reply.body.error.code, 'INVALID_JSON');
  });
});

describe('DELETE /api/chocolate-types/:id', () => {
  it('deletes the item with 204 and no body', async () => {
    const reply = await call('DELETE', '/api/chocolate-types/5');
    assert.equal(reply.status, 204);
    assert.equal(reply.body, undefined);
    assert.equal((await call('GET', '/api/chocolate-types/5')).status, 404);
  });

  it('returns 404 when the same item is deleted twice', async () => {
    await call('DELETE', '/api/chocolate-types/5');
    const reply = await call('DELETE', '/api/chocolate-types/5');
    assert.equal(reply.status, 404);
    assert.equal(reply.body.error.code, 'NOT_FOUND');
  });

  it('returns 400 INVALID_ID for a non-numeric id', async () => {
    const reply = await call('DELETE', '/api/chocolate-types/abc');
    assert.equal(reply.status, 400);
    assert.equal(reply.body.error.code, 'INVALID_ID');
  });
});

describe('ChocolateTypeStore', () => {
  it('returns copies so callers cannot change stored items', () => {
    const store = new ChocolateTypeStore();
    store.find(1)!.name = 'Changed';
    store.list()[0]!.name = 'Changed';
    store.create({ name: 'New', category: 'milk', cacaoPercent: 40, sugarFree: false }).name = 'Changed';
    store.update(2, { cacaoPercent: 36 })!.name = 'Changed';
    assert.deepEqual(
      store.list().map((item) => item.name),
      ['Dark 70', 'Milk Classic', 'White Vanilla', 'Ruby Berry', 'Dark 100 Pure', 'New'],
    );
  });

  it('update keeps the id and returns undefined for an unknown id', () => {
    const store = new ChocolateTypeStore();
    assert.deepEqual(store.update(1, { cacaoPercent: 75 }), {
      id: 1,
      name: 'Dark 70',
      category: 'dark',
      cacaoPercent: 75,
      sugarFree: false,
    });
    assert.equal(store.update(999, { cacaoPercent: 75 }), undefined);
  });
});

describe('start options', () => {
  it('serves the given seed data instead of the default data', async () => {
    const custom = await startChocolateApi({ seed: [{ name: 'Only', category: 'ruby', cacaoPercent: 50, sugarFree: false }] });
    try {
      const body = await (await fetch(`${custom.baseUrl}/api/chocolate-types`)).json();
      assert.deepEqual(body.data, [{ id: 1, name: 'Only', category: 'ruby', cacaoPercent: 50, sugarFree: false }]);
    } finally {
      await stopChocolateApi(custom.server);
    }
  });

  it('answers 503 with Retry-After 0 for the listed collection requests only', async () => {
    const custom = await startChocolateApi({ failListRequests: [1, 3] });
    try {
      const results: Array<[number, string | null]> = [];
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const response = await fetch(`${custom.baseUrl}/api/chocolate-types`);
        await response.text();
        results.push([response.status, response.headers.get('retry-after')]);
      }
      const item = await fetch(`${custom.baseUrl}/api/chocolate-types/1`);
      assert.equal(item.status, 200);
      assert.deepEqual(results, [
        [503, '0'],
        [200, null],
        [503, '0'],
        [200, null],
      ]);
    } finally {
      await stopChocolateApi(custom.server);
    }
  });
});

describe('routing', () => {
  it('returns 404 ROUTE_NOT_FOUND for an unknown path', async () => {
    const reply = await call('GET', '/api/unknown');
    assert.equal(reply.status, 404);
    assert.equal(reply.body.error.code, 'ROUTE_NOT_FOUND');
  });

  it('does not accept a trailing slash on the collection', async () => {
    const reply = await call('GET', '/api/chocolate-types/');
    assert.equal(reply.status, 404);
    assert.equal(reply.body.error.code, 'ROUTE_NOT_FOUND');
  });

  it('returns 405 with Allow for an unsupported method on the collection', async () => {
    const reply = await call('PUT', '/api/chocolate-types');
    assert.equal(reply.status, 405);
    assert.equal(reply.headers.get('allow'), 'GET, POST');
  });

  it('returns 405 with Allow for an unsupported method on an item', async () => {
    const reply = await call('PUT', '/api/chocolate-types/1');
    assert.equal(reply.status, 405);
    assert.equal(reply.headers.get('allow'), 'GET, PATCH, DELETE');
  });
});
