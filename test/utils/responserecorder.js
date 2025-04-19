import { Writable } from 'node:stream';

/**
 * Creates a response recorder that simulates a Node.js HTTP response.
 */
export function makeResponseRecorder() {
  const bodyChunks = [];

  const res = new Writable({
    write(chunk, _enc, cb) {
      bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      cb();
    }
  });

  /* ---------------- HTTP‑ish helpers ---------------- */

  res.statusCode = 200;
  res.headers = Object.create(null);

  res.writeHead = function (status, headers = {}) {
    this.statusCode = status;
    for (const [k, v] of Object.entries(headers)) {
      this.headers[k.toLowerCase()] = v;
    }
  };

  res.setHeader = function (key, value) {
    this.headers[key.toLowerCase()] = value;
  };

  res.getHeader = function (key) {
    return this.headers[key.toLowerCase()];
  };

  // do NOT duplicate body capture here – Writable.end() calls write() internally
  const _end = res.end;
  res.end = function (chunk, ...args) {
    return _end.call(this, chunk, ...args);
  };

  res.getBody = function () {
    return Buffer.concat(bodyChunks).toString('utf8');
  };

  return res;
}
