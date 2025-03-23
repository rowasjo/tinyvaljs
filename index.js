import http from 'node:http';
import { makeApp} from './app.js';

const PORT = process.env.PORT || 8080;

const handler = makeApp()
const server = http.createServer(handler)

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`)
})
