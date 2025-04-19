import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const swaggeruiHtml = readFileSync(join(__dirname, 'swaggerui.html'), 'utf8');
export const openapiYaml = readFileSync(join(__dirname, '../../openapi.yaml'), 'utf8');

export function openapiHandler(req, res) {
  res.writeHead(200, { headerContentType: 'application/json' })
  res.end(openapiYaml)
}

export function swaggeruiHandler(req, res) {
  res.writeHead(200, { headerContentType: 'application/yaml'})
  res.end(swaggeruiHtml)
}