import http from 'node:http';
import { makeApp} from './app.js';
import { DiskRepository } from '../lib/repository.js'

const PORT = process.env.PORT || 8080;

const dataDir = process.env.TINYVAL_DATA_DIR;
if (!dataDir) {
  console.error('Error: TINYVAL_DATA_DIR environment variable is required.');
  process.exit(1);
}

const repo = new DiskRepository(dataDir);

const handler = makeApp(repo)
const server = http.createServer(handler)

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`)
})
