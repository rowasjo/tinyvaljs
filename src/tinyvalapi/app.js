import { makeRouter } from '../lib/router.js'
import { addRoutes } from './routes.js'

export function makeApp() {

  const router = makeRouter()
  addRoutes(router)

  return (req, res) => router.dispatch(req, res)
}
