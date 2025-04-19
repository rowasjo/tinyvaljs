import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { Transform } from 'stream'
import { pipeline } from 'stream/promises'


export class HashMismatchError extends Error {
  constructor(expected, actual) {
    super(`blob content hash mismatch: expected ${expected}, got ${actual}`);
    this.name = 'HashMismatchError';
    this.expected = expected;
    this.actual = actual;
  }
}

export class NotFoundError extends Error {
  constructor(hash) {
    super(`blob not found: ${hash}`);
    this.name = 'NotFoundError';
  }
}

/**
 * Repository interface (documentation only).
 *   async put(hash, readable)  -> void
 *   async get(hash)            -> { stream: ReadStream, size: number }
 */

/* -------------------------------------------------------------------------- */
/*                               DiskRepository                               */
/* -------------------------------------------------------------------------- */

export class DiskRepository {
  /**
   * @param {string} baseDir - directory that will hold blobs (one file per hash)
   */
  constructor(baseDir) {
    this.baseDir = baseDir;
  }

  /**
   * Atomically write the stream under its SHA‑256 key.
   *
   * The file is first written to a temp file in the same directory and
   * fsync‑ed before being renamed into place, so readers will see either the
   * complete blob or nothing.
   *
   * @param {string}            hash      expected lowercase hex SHA‑256
   * @param {ReadableStream}    src       source stream
   */
  async put(hash, src) {
    const finalPath = path.join(this.baseDir, hash);
    const tmpPath = path.join(this.baseDir, `tmp-${crypto.randomUUID()}`)

    try {
      await writeStreamWithHashValidation(src, hash, tmpPath);

      await syncFile(tmpPath);

      // Atomic rename: guarantees "all or nothing" visibility
      await fs.promises.rename(tmpPath, finalPath);
    } finally {
      cleanupTmpFile(tmpPath);
    }
  }

  /**
   * @param {string} hash
   * @returns {Promise<{ stream: fs.ReadStream, size: number }>}
   */
  async get(hash) {
    const filePath = path.join(this.baseDir, hash)

    let stat;
    try {
      stat = await fs.promises.stat(filePath);
    } catch (err) {
      if (err.code === 'ENOENT') {
       throw new NotFoundError(hash);
      }
      throw err;
    }

    const stream = fs.createReadStream(filePath)
    return { stream, size: stat.size };
  }
}

async function writeStreamWithHashValidation(src, expectedHash, destPath) {
  const hasher = crypto.createHash('sha256');
  const hashTransform = new Transform({
    transform(chunk, encoding, cb) {
      hasher.update(chunk);
      cb(null, chunk); // pass through unchanged
    }
  });

  const handle = await fs.promises.open(destPath, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL, 0o600);
  const tmpStream = handle.createWriteStream();

  try {
    await pipeline(src, hashTransform, tmpStream);
    const actualHash = hasher.digest('hex');

    if (actualHash !== expectedHash) {
      throw new HashMismatchError(expectedHash, actualHash);
    }
  } finally {
    await handle.close();
  }
}

// Commit file contents and metadata to persistent storage
async function syncFile(filePath) {
  const handle = await fs.promises.open(filePath, 'r');
  await handle.sync();
  await handle.close();
}

async function cleanupTmpFile(tmpPath) {
  try { 
    await fs.promises.unlink(tmpPath); 
  } catch { /* ignore */ } 
}
