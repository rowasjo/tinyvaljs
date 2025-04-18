import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import stream from 'node:stream'

import { DiskRepository, NotFoundError, HashMismatchError } from '../src/lib/repository.js'

const EXAMPLE_KEY = 'bfb272e79d30466cf1af7c16739659e8b4e9b85b5075bdb922806c55035497cf';
const EXAMPLE_VALUE = 'I am a little blob.';
const EXAMPLE_SIZE = 19;

function tmpDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'repo-'));
}

test('Get missing blob raises NotFoundError', async () => {
  const repo = new DiskRepository(await tmpDir());

  const op = () => repo.get('unknown key');
  const isNotFoundError = (err) => err instanceof NotFoundError;
  await assert.rejects(op, isNotFoundError);
});

test('Put invalid blob raises HashMismatchError', async () => {
  const repo = new DiskRepository(await tmpDir());

  const badkey = 'bad key';
  const op = () => repo.put(badkey, stream.Readable.from(EXAMPLE_VALUE))
  const IsHashMismatchError = (err) => err instanceof HashMismatchError;
  await assert.rejects(op, IsHashMismatchError);
});

test('Put and Get Blob', async() => {
  const repo = new DiskRepository(await tmpDir());

  await repo.put(EXAMPLE_KEY, stream.Readable.from(EXAMPLE_VALUE));

  const { stream: rs, size } = await repo.get(EXAMPLE_KEY);
  assert.equal(size, EXAMPLE_SIZE);

  let data = '';
  for await (const chunk of rs) {
    data += chunk.toString('utf8');
  }
  assert.equal(data, EXAMPLE_VALUE);
});
