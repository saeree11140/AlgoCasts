import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../public/sandbox.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

// Runs sandbox.html's script against a minimal fake window; returns hooks to drive it.
function loadSandbox() {
  const listeners = new Set();
  const sent = [];
  const workers = [];
  const parent = { postMessage: (data) => sent.push(data) };
  const context = {
    parent,
    // honours {once:true} the way browsers do: removed after the first event of that type, matched or not
    addEventListener: (type, fn, options) => {
      if (type !== 'message') return;
      if (options?.once) { const wrapped = (e) => { listeners.delete(wrapped); fn(e); }; wrapped.original = fn; listeners.add(wrapped); }
      else listeners.add(fn);
    },
    removeEventListener: (type, fn) => {
      if (type !== 'message') return;
      for (const l of listeners) if (l === fn || l.original === fn) listeners.delete(l);
    },
    Blob: class { constructor(parts) { this.parts = parts; } },
    URL: { createObjectURL: () => 'blob:fake', revokeObjectURL: () => {} },
    Worker: class { constructor(url) { this.url = url; workers.push(this); } terminate() {} },
  };
  vm.runInNewContext(script, context);
  const dispatch = (event) => { for (const fn of [...listeners]) fn(event); };
  return { parent, sent, workers, dispatch };
}

test('sandbox announces it is ready', () => {
  const { sent } = loadSandbox();
  assert.equal(sent[0].type, 'ready');
});

test('a foreign message (e.g. from a browser extension) does not swallow the run message', () => {
  const { parent, workers, dispatch } = loadSandbox();
  dispatch({ source: {}, data: { source: 'react-devtools-content-script', hello: true } });
  dispatch({ source: parent, data: { type: 'run', program: 'postMessage(1)' } });
  assert.equal(workers.length, 1);
});

test('only the first valid run message starts a worker', () => {
  const { parent, workers, dispatch } = loadSandbox();
  dispatch({ source: parent, data: { type: 'run', program: 'a' } });
  dispatch({ source: parent, data: { type: 'run', program: 'b' } });
  assert.equal(workers.length, 1);
});
