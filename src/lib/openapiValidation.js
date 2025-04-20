import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Enforcer = require('openapi-enforcer');

import { fileURLToPath, URL } from 'node:url'
import { dirname, join } from 'node:path'


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const openapi = await Enforcer(join(__dirname, '../../openapi.yaml')); // load & validate once

export function validationMiddleware(next) {
  return async (req, res) => {
    const { pathname, searchParams } = new URL(req.url, 'http://ignored');

    const opts = {
      method : req.method,
      path   : pathname,
      query: Object.fromEntries(searchParams),
      headers: req.headers || {},
    };

    if (requestHasBody(req)) {
      // currently only binary blob required, so we just set empty buffer as body to avoid consuming body
      opts.body = Buffer.alloc(0);
    }

    const [validated, err] = openapi.request(opts);
  
    if (err) {
      res.writeHead(400, { 'Content-Type': 'text/plain'})
      res.end(err.toString());
      return;
    }

    await next(req, res);
  };
}

function requestHasBody(req) {
  const headers = req.headers ?? {};
  const contentLength = headers['content-length'];
  const transferEncoding = headers['transfer-encoding'];

  return (
    (typeof contentLength === 'string' && contentLength !== '0') ||
    (typeof transferEncoding === 'string' && transferEncoding.toLowerCase() === 'chunked')
  );
}