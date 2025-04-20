import { openapiHandler, swaggeruiHandler } from './openapiHandlers.js'
import { getBlobHandler, putBlobHandler } from './blobHandlers.js'
import { loggingMiddleware } from '../lib/loggingMiddleware.js'
import { validationMiddleware } from '../lib/openapiValidation.js'

export async function addRoutes(router, repo) {
  const coreMiddlewares = loggingMiddleware;

  router.handle('GET', '/openapi.yaml', coreMiddlewares(openapiHandler));
  router.handle('GET', '/docs', coreMiddlewares(swaggeruiHandler));

  const blobMiddlewares =  (handler) => { return coreMiddlewares(validationMiddleware(handler)); };

  await router.handle('GET', '/blobs/:hash', blobMiddlewares((getBlobHandler(repo))));
  await router.handle('PUT', '/blobs/:hash', blobMiddlewares(putBlobHandler(repo)));
}
