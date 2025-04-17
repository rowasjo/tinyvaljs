import { openapiHandler, swaggeruiHandler } from './openapiHandlers.js'

export function addRoutes(router) {
  router.handle('GET', '/openapi.yaml', openapiHandler)
  router.handle('GET', '/docs', swaggeruiHandler)
}
