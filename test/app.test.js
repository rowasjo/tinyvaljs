import test from 'node:test';
import assert from 'node:assert';
import { makeResponseRecorder } from './utils/responserecorder.js'; './utils/responserecorder.js'
import { makeApp } from '../app.js';

test('healthy', (t) => {
  const handler = makeApp()

  const req = { 
    method: 'GET', 
    url: '/' 
  };
  const res = makeResponseRecorder()

  handler(req, res)

  assert.strictEqual(res.statusCode, 200)
  assert.strictEqual(res.getBody(), 'Hello World!\n')
})
