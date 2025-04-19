
import { pipeline } from 'stream/promises'


/**
 * GET / HEAD  – download a blob
 *
 * @param {Repository} repo
 * @returns {(req: import('http').IncomingMessage,
*           res: import('http').ServerResponse) => Promise<void>}
*/
export function getBlobHandler(repo) {
  return async function (req, res) {
    const hash = req.params.hash

    if (!isSha256Hexadecimal(hash)) {
      writeErrorResponse(res, 400, 'Invalid hash format');
      return;
    }

    let stream, size
    try {
      ({ stream, size } = await repo.get(hash));
    } catch (err) {
      if (err?.name === 'NotFoundError') {
        writeErrorResponse(res, 404, 'Not Found');
      } else {
        console.error('failed to fetch blob:', err);
        writeErrorResponse(res, 500, 'Internal error fetching blob');
      }
      return;
    }

    const headers = {
      'Cache-Control': 'max-age=31536000, immutable',
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(size),
    };

    if (req.method === 'HEAD') {
      res.writeHead(200, headers);
      res.end();
      return;
    }

    res.writeHead(200, headers);
    await pipeline(stream, res);
  }
}

/**
 * PUT  – upload a blob
 *
 * @param {Repository} repo
 * @returns {(req: import('http').IncomingMessage,
*           res: import('http').ServerResponse) => Promise<void>}
*/
export function putBlobHandler(repo) {
  return async function (req, res) {
    const hash = req.params.hash

    if (!isSha256Hexadecimal(hash)) {
      writeErrorResponse(res, 400, 'Invalid hash format');
      return;
    }

    try {
      await repo.put(hash, req);
    } catch(err) {
      if (err?.name === 'HashMismatchError') {
        writeErrorResponse(res, 422, err.message);
      } else {
        console.error('failed to store blob:', err);
        writeErrorResponse(res, 500, 'failed to store blob');
      }
      return
    }

    res.writeHead(204);
    res.end();
  }
}

function writeErrorResponse(res, statusCode, message) {
  res.writeHead(statusCode, {'Content-Type': 'text/plain'});
  res.end(message);
}

function isSha256Hexadecimal(hash) {
  return /^[a-f0-9]{64}$/.test(hash)
}
