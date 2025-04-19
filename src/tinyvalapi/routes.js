import { openapiHandler, swaggeruiHandler } from './openapiHandlers.js'
import { getBlobHandler, putBlobHandler } from './blobHandlers.js'
import { loggingMiddleware } from '../lib/loggingMiddleware.js'

export async function addRoutes(router, repo) {
  router.handle('GET', '/openapi.yaml', loggingMiddleware(openapiHandler));
  router.handle('GET', '/docs', loggingMiddleware(swaggeruiHandler));

  await router.handle('GET', '/blobs/:hash', loggingMiddleware(getBlobHandler(repo)));
  await router.handle('PUT', '/blobs/:hash', loggingMiddleware(putBlobHandler(repo)));
}
