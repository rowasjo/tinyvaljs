export function loggingMiddleware(next) {
  return async (req, res) => {

    console.log("Request:", {
      method: req.method,
      path: req.url,
    });

    await next(req, res);

    console.log("Response", {
      method: req.method,
      path: req.url,
      status: res.statusCode,
    });
  }
}
