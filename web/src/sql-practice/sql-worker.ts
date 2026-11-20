import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import {exercises, fixtures, sqlMaxLength} from './exercises';
import {judgeSql, type SqlAttempt} from './judge';

export interface SqlRequest {
  id: string;
  query: string;
  check: boolean;
}

export type SqlReply = SqlAttempt | {error: string};

// Use the self-hosted WASM asset in the worker and keep SQL off the UI thread.
self.onmessage = async ({data}: MessageEvent<SqlRequest>) => {
  try {
    const exercise = exercises.find(item => item.id === data.id);
    if (!exercise || data.query.length > sqlMaxLength) throw new Error('โจทย์หรือความยาว SQL ไม่ถูกต้อง');
    const SQL = await initSqlJs({locateFile: () => wasmUrl, useOldExtensionFunctions: false});
    self.postMessage(judgeSql(SQL, exercise, fixtures, data.query, data.check) satisfies SqlReply);
  } catch (error) {
    self.postMessage({error: error instanceof Error ? error.message : String(error)} satisfies SqlReply);
  }
};
