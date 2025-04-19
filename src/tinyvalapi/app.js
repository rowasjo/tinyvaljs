import { makeRouter } from '../lib/router.js'
import { addRoutes } from './routes.js'

export function makeApp(repo) {
  const router = makeRouter()
  addRoutes(router, repo)

  return async (req, res) => {
    try {
      await router.dispatch(req, res)
    } catch (err) {
      console.error('Unhandled error in request handler:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error\n');
    }
  }
}
