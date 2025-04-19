export function loggingMiddleware(handler) {
  return async (req, res) => {

    console.log("Request:", {
      method: req.method,
      path: req.url,
    });

    await handler(req, res);

    console.log("Response", {
      method: req.method,
      path: req.url,
      status: res.statusCode,
    });
  }
}
