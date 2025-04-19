import { openapiHandler, swaggeruiHandler } from './openapiHandlers.js'
import { getBlobHandler, putBlobHandler } from './blobHandlers.js'

export async function addRoutes(router, repo) {
  router.handle('GET', '/openapi.yaml', openapiHandler);
  router.handle('GET', '/docs', swaggeruiHandler);

  await router.handle('GET', '/blobs/:hash', getBlobHandler(repo));
  await router.handle('PUT', '/blobs/:hash', putBlobHandler(repo));
}
