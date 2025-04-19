import "urlpattern-polyfill"

// Minimal router using native URLPattern
// GET also matches HEAD
export function makeRouter() {
  const routes = []

  return {
    handle(method, pattern, handler) {
      const urlPattern = new URLPattern({ pathname: pattern })
      routes.push({method, urlPattern, handler})

      // sort, ensuring longer (more specific) patterns takes precedence
      routes.sort((a, b) => b.urlPattern.pathname.length - a.urlPattern.pathname.length)
    },
    async dispatch(req, res) {
      const url = new URL(req.url, `http://localhost`)
      for (const { method, urlPattern, handler } of routes) {
        const methodMatch = req.method === method || (req.method === 'HEAD' && method === 'GET');
        if (methodMatch && urlPattern.test({ pathname: url.pathname })) {
          req.params = urlPattern.exec({ pathname: url.pathname }).pathname.groups;
          await handler(req, res);
          return;
        }
      }
      res.writeHead(404, { 'Content-Type': 'text/plain'})
      res.end('Not Found\n')
    }
  }
}
