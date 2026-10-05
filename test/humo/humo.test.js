// Etapa de VERIFICACIÓN (humo) contra la URL pública ya desplegada.
//   BASE_URL=https://<usuario>.github.io/citaya EXPECTED_SHA=<sha> npm run test:humo
// GitHub Pages puede tardar unos segundos en servir la versión nueva: se reintenta durante 2 minutos.
import { it } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = (process.env.BASE_URL || "").replace(/\/$/, "");
const ESPERADO = process.env.EXPECTED_SHA;
const espera = ms => new Promise(r => setTimeout(r, ms));

it("producción sirve exactamente la versión que acabamos de desplegar", { timeout: 150_000 }, async () => {
  assert.ok(BASE_URL, "Define BASE_URL");
  let ultima;
  for (let intento = 1; intento <= 12; intento++) {
    try {
      const r = await fetch(`${BASE_URL}/version.json?t=${Date.now()}`, { cache: "no-store" });
      if (r.ok) {
        ultima = await r.json();
        if (!ESPERADO || ultima.sha === ESPERADO) break;
      }
    } catch { /* aún no responde */ }
    await espera(10_000);
  }
  assert.ok(ultima, "La web publicada no responde");
  if (ESPERADO) assert.equal(ultima.sha, ESPERADO, "Producción no sirve el commit desplegado");
});

it("la portada carga", async () => {
  const r = await fetch(`${BASE_URL}/`);
  assert.equal(r.status, 200);
  assert.match(await r.text(), /CitaYa/);
});
