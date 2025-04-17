import "urlpattern-polyfill"

// Minimal router using native URLPattern
export function makeRouter() {
  const routes = []

  return {
    handle(method, pattern, handler) {
      const urlPattern = new URLPattern({ pathname: pattern })
      routes.push({method, urlPattern, handler})

      // sort, ensuring longer (more specific) patterns takes precedence
      routes.sort((a, b) => b.urlPattern.pathname.length - a.urlPattern.pathname.length)
    },
    dispatch(req, res) {
      const url = new URL(req.url, `http://${req.headers.host}`)
      for (const { method, urlPattern, handler } of routes) {
        if (req.method === method && urlPattern.test({ pathname: url.pathname })) {
          req.params = urlPattern.exec({ pathname: url.pathname }).pathname.groups
          return handler(req, res)
        }
      }
      res.writeHead(404, { 'Content-Type': 'text/plain'})
      res.end('Not Found\n')
    }
  }
}
