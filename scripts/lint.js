// Lint mínimo sin dependencias: reglas que el equipo acordó y que la CI hace cumplir.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const reglas = [
  { patron: /console\.log\(/, msg: "console.log en código de producción", solo: /^(src|public)\// },
  { patron: /\bdebugger\b/, msg: "sentencia debugger", solo: /^(src|public|test)\// },
  { patron: /\b(describe|it|test)\.only\(/, msg: ".only() en pruebas: ejecutaría solo una parte", solo: /^test\// },
  { patron: /\t/, msg: "tabulador (usamos espacios)" },
];

function archivos(dir) {
  return readdirSync(dir).flatMap(n => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? archivos(p) : /\.(js|html|css|json)$/.test(n) ? [p] : [];
  });
}

let errores = 0;
for (const f of ["src", "public", "test", "scripts", "config"].flatMap(archivos)) {
  const texto = readFileSync(f, "utf8");
  if (f.endsWith(".json")) {
    try { JSON.parse(texto); } catch (e) { console.error(`${f}: JSON inválido (${e.message})`); errores++; }
  }
  texto.split("\n").forEach((linea, i) => {
    for (const r of reglas) {
      if ((!r.solo || r.solo.test(f)) && r.patron.test(linea)) { console.error(`${f}:${i + 1}: ${r.msg}`); errores++; }
    }
  });
  if (texto.length && !texto.endsWith("\n")) { console.error(`${f}: falta salto de línea final`); errores++; }
}
if (errores) { console.error(`\n✗ lint: ${errores} problema(s)`); process.exit(1); }
console.log("✓ lint sin problemas");
