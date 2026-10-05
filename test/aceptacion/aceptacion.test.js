// Etapa de ACEPTACIÓN: se ejecuta contra el artefacto dist/ ya construido y servido por HTTP.
// Comprueba los compromisos con el negocio (acuerdo de nivel de servicio con la Concejalía), no detalles de código.
//   BASE_URL=http://localhost:8080 npm run test:aceptacion
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = (process.env.BASE_URL || "http://localhost:8080").replace(/\/$/, "");
const dominio = await import(new URL("../../dist/src/citas.js", import.meta.url));

async function get(ruta) {
  const r = await fetch(`${BASE_URL}${ruta}`);
  return { status: r.status, texto: await r.text() };
}

describe("el artefacto se sirve completo", () => {
  it("la portada responde y es CitaYa", async () => {
    const { status, texto } = await get("/");
    assert.equal(status, 200);
    assert.match(texto, /CitaYa/);
  });

  it("version.json identifica la versión y el commit", async () => {
    const v = JSON.parse((await get("/version.json")).texto);
    assert.ok(v.version, "falta version");
    assert.ok(v.sha, "falta sha");
  });

  it("los feature flags son JSON válido con valores booleanos", async () => {
    const flags = JSON.parse((await get("/config/flags.json")).texto);
    for (const [nombre, valor] of Object.entries(flags)) assert.equal(typeof valor, "boolean", `flag ${nombre}`);
  });

  it("el módulo de dominio se publica para el navegador", async () => {
    assert.equal((await get("/src/citas.js")).status, 200);
    assert.equal((await get("/app.js")).status, 200);
  });
});

describe("compromisos del servicio (acuerdo con la Concejalía)", () => {
  it("cada oficina ofrece al menos 20 citas al día por ventanilla", () => {
    assert.ok(dominio.franjasDelDia().length >= 20,
      `Solo hay ${dominio.franjasDelDia().length} franjas al día: se incumple la capacidad mínima comprometida (20)`);
  });

  it("se atiende desde las 09:00", () => {
    assert.equal(dominio.franjasDelDia()[0], "09:00");
  });

  it("un ciudadano puede reservar el próximo día laborable en cualquier oficina", () => {
    const ahora = new Date("2026-10-01T10:00:00");
    for (const o of dominio.OFICINAS) {
      const agenda = dominio.crearAgenda();
      const cita = dominio.reservar(agenda, { oficinaId: o.id, tramiteId: "PADRON", fecha: "2026-10-02", hora: "09:00", dni: "12345678Z" }, ahora);
      assert.equal(cita.estado, "activa");
    }
  });
});
