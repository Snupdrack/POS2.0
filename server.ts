import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

console.log(`[NITO'S] 🚀 Iniciando servidor...`)
console.log(`[NITO'S] Puerto: ${port} | Host: ${hostname} | Ambiente: ${dev ? 'desarrollo' : 'produccion'}`)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  }).listen(port, hostname, () => {
    console.log(`[NITO'S] ✅ Servidor listo en http://${hostname}:${port}`)
  })
})
