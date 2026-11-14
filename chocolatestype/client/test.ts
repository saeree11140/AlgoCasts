import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { afterEach, describe, it } from 'node:test';
import { startChocolateApi, stopChocolateApi, type ApiOptions } from '../api/index';
import type { ChocolateTypeData } from '../api/store';
import { chocolateReport, type ChocolateReport } from './index';

let server: Server | undefined;

afterEach(async () => {
  if (server) await stopChocolateApi(server);
  server = undefined;
});

async function start(options: ApiOptions = {}): Promise<string> {
  const started = await startChocolateApi(options);
  server = started.server;
  return started.baseUrl;
}

const CATEGORIES = ['dark', 'milk', 'white', 'ruby'] as const;

// "Bar n": category cycles dark, milk, white, ruby and cacaoPercent is n % 100.
function bars(count: number): ChocolateTypeData[] {
  return Array.from({ length: count }, (_, index) => ({
    name: `Bar ${index + 1}`,
    category: CATEGORIES[index % 4],
    cacaoPercent: (index + 1) % 100,
    sugarFree: false,
  }));
}

function bar(name: string, category: ChocolateTypeData['category'], cacaoPercent: number): ChocolateTypeData {
  return { name, category, cacaoPercent, sugarFree: false };
}

function totalCount(report: ChocolateReport): number {
  return Object.values(report).reduce((sum, entry) => sum + entry.count, 0);
}

const DEFAULT_SEED_REPORT: ChocolateReport = {
  dark: { count: 2, avgCacao: 85, strongest: 'Dark 100 Pure' },
  milk: { count: 1, avgCacao: 35, strongest: 'Milk Classic' },
  white: { count: 1, avgCacao: 0, strongest: 'White Vanilla' },
  ruby: { count: 1, avgCacao: 47, strongest: 'Ruby Berry' },
};

const BARS_120_REPORT: ChocolateReport = {
  dark: { count: 30, avgCacao: 42.33, strongest: 'Bar 97' },
  milk: { count: 30, avgCacao: 43.33, strongest: 'Bar 98' },
  white: { count: 30, avgCacao: 44.33, strongest: 'Bar 99' },
  ruby: { count: 30, avgCacao: 42, strongest: 'Bar 96' },
};

describe('Examples', () => {
  it('Example 1: minCacao = 0 reports every category', async () => {
    const baseUrl = await start();
    assert.deepEqual(await chocolateReport(baseUrl, 0), DEFAULT_SEED_REPORT);
  });

  it('Example 2: minCacao = 50 keeps only matching categories', async () => {
    const baseUrl = await start();
    assert.deepEqual(await chocolateReport(baseUrl, 50), {
      dark: { count: 2, avgCacao: 85, strongest: 'Dark 100 Pure' },
    });
  });

  it('Example 3: no matching items gives an empty object', async () => {
    const baseUrl = await start({ seed: [bar('Low', 'milk', 10)] });
    assert.deepEqual(await chocolateReport(baseUrl, 11), {});
  });
});

describe('Edge cases', () => {
  it('treats minCacao as inclusive', async () => {
    const baseUrl = await start();
    assert.deepEqual(await chocolateReport(baseUrl, 100), {
      dark: { count: 1, avgCacao: 100, strongest: 'Dark 100 Pure' },
    });
    assert.deepEqual(await chocolateReport(baseUrl, 70), {
      dark: { count: 2, avgCacao: 85, strongest: 'Dark 100 Pure' },
    });
  });

  it('returns an empty object when the API has no items', async () => {
    const baseUrl = await start({ seed: [] });
    assert.deepEqual(await chocolateReport(baseUrl, 0), {});
  });

  it('rounds avgCacao to 2 decimal places', async () => {
    const baseUrl = await start({
      seed: [bar('D1', 'dark', 70), bar('D2', 'dark', 71), bar('D3', 'dark', 71), bar('W1', 'white', 0), bar('W2', 'white', 0), bar('W3', 'white', 1)],
    });
    assert.deepEqual(await chocolateReport(baseUrl, 0), {
      dark: { count: 3, avgCacao: 70.67, strongest: 'D2' },
      white: { count: 3, avgCacao: 0.33, strongest: 'W3' },
    });
  });

  it('breaks strongest ties by the lowest id, not by name', async () => {
    const baseUrl = await start({ seed: [bar('Zeta', 'dark', 80), bar('Alpha', 'dark', 80), bar('Beta', 'dark', 60)] });
    assert.deepEqual(await chocolateReport(baseUrl, 0), {
      dark: { count: 3, avgCacao: 73.33, strongest: 'Zeta' },
    });
  });
});

describe('Pagination', () => {
  it('collects every page', async (t) => {
    const baseUrl = await start({ seed: bars(120) });
    const fetchSpy = t.mock.method(globalThis, 'fetch');
    assert.deepEqual(await chocolateReport(baseUrl, 0), BARS_120_REPORT);
    assert.equal(fetchSpy.mock.callCount(), 3, '120 items need 3 pages of 50');
  });

  it('makes exactly one request for exactly 50 items', async (t) => {
    const baseUrl = await start({ seed: bars(50) });
    const fetchSpy = t.mock.method(globalThis, 'fetch');
    assert.equal(totalCount(await chocolateReport(baseUrl, 0)), 50);
    assert.equal(fetchSpy.mock.callCount(), 1);
  });

  it('makes two requests for 51 items', async (t) => {
    const baseUrl = await start({ seed: bars(51) });
    const fetchSpy = t.mock.method(globalThis, 'fetch');
    assert.equal(totalCount(await chocolateReport(baseUrl, 0)), 51);
    assert.equal(fetchSpy.mock.callCount(), 2);
  });

  it('filters on the server with minCacao', async (t) => {
    const baseUrl = await start({ seed: bars(120) });
    const fetchSpy = t.mock.method(globalThis, 'fetch');
    assert.deepEqual(await chocolateReport(baseUrl, 95), {
      dark: { count: 1, avgCacao: 97, strongest: 'Bar 97' },
      milk: { count: 1, avgCacao: 98, strongest: 'Bar 98' },
      white: { count: 2, avgCacao: 97, strongest: 'Bar 99' },
      ruby: { count: 1, avgCacao: 96, strongest: 'Bar 96' },
    });
    assert.equal(fetchSpy.mock.callCount(), 1, 'only 5 items match, so one page is enough');
  });
});

describe('Retry', () => {
  it('retries 503 on the first page', async (t) => {
    const baseUrl = await start({ failListRequests: [1, 2] });
    const fetchSpy = t.mock.method(globalThis, 'fetch');
    assert.deepEqual(await chocolateReport(baseUrl, 0), DEFAULT_SEED_REPORT);
    assert.equal(fetchSpy.mock.callCount(), 3);
  });

  it('retries 503 in the middle of pagination without losing or repeating items', async (t) => {
    const baseUrl = await start({ seed: bars(120), failListRequests: [2] });
    const fetchSpy = t.mock.method(globalThis, 'fetch');
    assert.deepEqual(await chocolateReport(baseUrl, 0), BARS_120_REPORT);
    assert.equal(fetchSpy.mock.callCount(), 4);
  });

  it('gives each request its own budget of 3 retries', async (t) => {
    const baseUrl = await start({ seed: bars(120), failListRequests: [1, 2, 3, 5, 6, 7] });
    const fetchSpy = t.mock.method(globalThis, 'fetch');
    assert.deepEqual(await chocolateReport(baseUrl, 0), BARS_120_REPORT);
    assert.equal(fetchSpy.mock.callCount(), 9);
  });

  it('throws an error mentioning 503 after 3 failed retries', async (t) => {
    const baseUrl = await start({ failListRequests: [1, 2, 3, 4] });
    const fetchSpy = t.mock.method(globalThis, 'fetch');
    await assert.rejects(chocolateReport(baseUrl, 0), /\b503\b/);
    assert.equal(fetchSpy.mock.callCount(), 4);
  });

  it('throws right away for errors other than 503', async (t) => {
    const baseUrl = await start();
    const fetchSpy = t.mock.method(globalThis, 'fetch');
    await assert.rejects(chocolateReport(baseUrl, 101), /\b400\b/);
    assert.equal(fetchSpy.mock.callCount(), 1);
  });
});
