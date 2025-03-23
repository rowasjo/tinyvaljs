/**
 * Creates a response recorder that simulates a Node.js HTTP response.
 */
export function makeResponseRecorder() {
  let body = '';
  return {
    statusCode: 200,
    headers: {},
    writeHead(status, headers) {
      this.statusCode = status;
      this.headers = headers;
    },
    end(chunk) {
      body += chunk;
    },
    getBody() {
      return body;
    }
  }
}
