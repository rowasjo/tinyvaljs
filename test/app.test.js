import test from 'node:test';
import assert from 'node:assert';
import { makeResponseRecorder } from './utils/responserecorder.js'; './utils/responserecorder.js'
import { makeApp } from '../src/tinyvalapi/app.js';

test('returns 404 for invalid path', (t) => {
  const handler = makeApp()

  const req = { 
    method: 'GET',
    url: '/bad/path',
    headers: {
      host: 'localhost'
    }
  };
  const res = makeResponseRecorder()

  handler(req, res)

  assert.strictEqual(res.statusCode, 404)
  assert.strictEqual(res.getBody(), 'Not Found\n')
})
