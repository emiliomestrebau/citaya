// Servidor estático mínimo para la etapa de aceptación: node scripts/serve.js <dir> <puerto>
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const raiz = process.argv[2] || "dist";
const puerto = Number(process.argv[3] || 8080);
const tipos = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

createServer(async (req, res) => {
  const ruta = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  const archivo = join(raiz, ruta.endsWith("/") ? `${ruta}index.html` : ruta);
  try {
    const cuerpo = await readFile(archivo);
    res.writeHead(200, { "content-type": tipos[extname(archivo)] || "application/octet-stream" });
    res.end(cuerpo);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("No encontrado");
  }
}).listen(puerto, () => process.stdout.write(`Sirviendo ${raiz} en http://localhost:${puerto}\n`));
