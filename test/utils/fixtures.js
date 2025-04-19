import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { DiskRepository } from '../../src/lib/repository.js'
import { makeApp } from '../../src/tinyvalapi/app.js'

export function tmpDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'repo-'));
}

export async function makeTestApp() {
  const repo = new DiskRepository(await tmpDir());
  return makeApp(repo)
}
