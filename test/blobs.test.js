import test from 'node:test';
import assert from 'node:assert';
import { Readable } from 'node:stream';

import { makeResponseRecorder } from './utils/responserecorder.js'
import { makeTestApp } from './utils/fixtures.js'

const UNKNOWN_BLOB_SHA256_HASH  = "61a04a46afa3c518551c887c6c1b2b1e4f25619fad3032c3d5c952849b2ff9db";
const EXAMPLE1_BLOB             = "I am a little blob.";
const EXAMPLE1_BLOB_SHA256_HASH = "bfb272e79d30466cf1af7c16739659e8b4e9b85b5075bdb922806c55035497cf";

test('GET /blobs/{hash} with invalid hash returns 400', async () => {
  const app = await makeTestApp();

  const res = await getBlob(app, 'invalid-hash');

  assert.equal(res.statusCode, 400);
});

test('GET unknown blob returns 404', async () => {
  const app = await makeTestApp();

  const res = await getBlob(app, UNKNOWN_BLOB_SHA256_HASH);

  assert.equal(res.statusCode, 404);
});

test('PUT blob with hash mismatch returns 422', async() => {
  const app = await makeTestApp();

  const body = 'body not matching hash';
  const req = makePutBlobRequest(UNKNOWN_BLOB_SHA256_HASH, body);
  const res = makeResponseRecorder();

  await app(req, res);
  
  assert.equal(res.statusCode, 422)
});

test('PUT blob with valid hash returns 204', async () => {
  const app = await makeTestApp();

  const res = await putExample1Blob(app);
  assert.equal(res.statusCode, 204);

});

test('PUT blob then GET', async () => {
  const app = await makeTestApp();

  const putRes = await putExample1Blob(app);
  assert.equal(putRes.statusCode, 204);

  const getRes = await getBlob(app, EXAMPLE1_BLOB_SHA256_HASH);

  assert.equal(getRes.statusCode, 200);
  assert.equal(getRes.getBody(), EXAMPLE1_BLOB);
});

test('PUT blob then HEAD', async () => {
  const app = await makeTestApp();

  const putRes = await putExample1Blob(app);
  assert.equal(putRes.statusCode, 204);

  const headRes = await headBlob(app, EXAMPLE1_BLOB_SHA256_HASH);

  assert.equal(headRes.statusCode, 200);
  assert.equal(headRes.getBody().length, 0);
  assert.equal(headRes.getHeader('Content-Length'), '19');
});

async function putExample1Blob(app) {
  const req = makePutBlobRequest(EXAMPLE1_BLOB_SHA256_HASH, EXAMPLE1_BLOB);
  const res = makeResponseRecorder();

  await app(req, res);
  return res
}

async function getBlob(app, hash) {
  const req = { method: 'GET', url: blobUrl(hash)};
  const res = makeResponseRecorder();

  await app(req, res);
  return res;
}

async function headBlob(app, hash) {
  const req = { method: 'HEAD', url: blobUrl(hash)};
  const res = makeResponseRecorder();

  await app(req, res);
  return res;
}

function blobUrl(hash) {
  return `/blobs/${hash}`
}

function makePutBlobRequest(hash, body) {
  return Object.assign(Readable.from(body), { 
    method: 'PUT', 
    url: blobUrl(hash),
    headers: { 'Content-Type': 'application/octet-stream' },
  });
}
