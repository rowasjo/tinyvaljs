import test from 'node:test';
import assert from 'node:assert';
import { makeResponseRecorder } from './utils/responserecorder.js'; './utils/responserecorder.js'
import { makeApp } from '../src/tinyvalapi/app.js';
import { openapiYaml, swaggeruiHtml } from '../src/tinyvalapi/openapiHandlers.js'

test('GET /openapi.yaml', (t) => {
  const handler = makeApp()

  const req = { 
    method: 'GET',
    url: '/openapi.yaml'
  };
  const res = makeResponseRecorder()

  handler(req, res)

  assert.strictEqual(res.statusCode, 200)
  assert.strictEqual(res.getBody(), openapiYaml)
})

test('GET /docs', (t) => {
  const handler = makeApp()

  const req = { 
    method: 'GET',
    url: '/docs'
  };
  const res = makeResponseRecorder()

  handler(req, res)

  assert.strictEqual(res.statusCode, 200)
  assert.strictEqual(res.getBody(), swaggeruiHtml)
})
