import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { crearAgenda, reservar, disponibilidad, franjasDelDia, dniValido, capacidadDiaria, estadisticas, OFICINAS, HORA_APERTURA, HORA_CIERRE, DURACION_FRANJA_MIN } from "../../src/citas.js";

const AHORA = new Date("2026-10-01T10:00:00");   // jueves
const LUNES = "2026-10-05";
const base = { oficinaId: "OAC-NORTE", tramiteId: "PADRON", fecha: LUNES, hora: "10:00", dni: "12345678Z" };

describe("franjas de atención", () => {
  it("empiezan a la hora de apertura y van de DURACION_FRANJA_MIN en DURACION_FRANJA_MIN hasta el cierre", () => {
    const f = franjasDelDia();
    assert.equal(f[0], `${String(HORA_APERTURA).padStart(2, "0")}:00`);
    assert.equal(f.length, ((HORA_CIERRE - HORA_APERTURA) * 60) / DURACION_FRANJA_MIN);
  });

  it("la capacidad diaria es franjas × ventanillas", () => {
    for (const o of OFICINAS) assert.equal(capacidadDiaria(o.id), franjasDelDia().length * o.ventanillas);
  });
});

describe("validación del DNI", () => {
  it("acepta DNI con letra correcta", () => {
    assert.ok(dniValido("12345678Z"));
    assert.ok(dniValido("12345678z"));
    assert.ok(dniValido("00000000T"));
  });

  it("rechaza letra incorrecta o formato erróneo", () => {
    assert.ok(!dniValido("12345678A"));
    assert.ok(!dniValido("1234567Z"));
    assert.ok(!dniValido(""));
  });
});

describe("reservar", () => {
  it("crea una cita activa con localizador", () => {
    const agenda = crearAgenda();
    const cita = reservar(agenda, base, AHORA);
    assert.equal(cita.estado, "activa");
    assert.match(cita.localizador, /^VDR-20261005-\d{4}$/);
    assert.equal(estadisticas(agenda).activas, 1);
  });

  it("ocupa un hueco de la franja", () => {
    const agenda = crearAgenda();
    reservar(agenda, base, AHORA);
    const franja = disponibilidad(agenda, "OAC-NORTE", LUNES).find(f => f.hora === "10:00");
    assert.equal(franja.libres, 0);
  });

  it("no permite sobrerreservar una franja", () => {
    const agenda = crearAgenda();
    reservar(agenda, base, AHORA);
    assert.throws(() => reservar(agenda, { ...base, dni: "87654321X" }, AHORA), { codigo: "FRANJA_COMPLETA" });
  });

  it("no permite dos citas activas del mismo DNI para el mismo trámite", () => {
    const agenda = crearAgenda();
    reservar(agenda, base, AHORA);
    assert.throws(() => reservar(agenda, { ...base, hora: "11:00" }, AHORA), { codigo: "CITA_DUPLICADA" });
  });

  it("rechaza fines de semana, horas fuera de franja y fechas pasadas", () => {
    const agenda = crearAgenda();
    assert.throws(() => reservar(agenda, { ...base, fecha: "2026-10-03" }, AHORA), { codigo: "DIA_NO_LABORABLE" });
    assert.throws(() => reservar(agenda, { ...base, hora: "14:00" }, AHORA), { codigo: "FRANJA_INVALIDA" });
    assert.throws(() => reservar(agenda, { ...base, hora: "10:07" }, AHORA), { codigo: "FRANJA_INVALIDA" });
    assert.throws(() => reservar(agenda, { ...base, fecha: "2026-09-28" }, AHORA), { codigo: "FECHA_PASADA" });
  });

  it("rechaza DNI inválido y oficina o trámite desconocidos", () => {
    const agenda = crearAgenda();
    assert.throws(() => reservar(agenda, { ...base, dni: "12345678A" }, AHORA), { codigo: "DNI_INVALIDO" });
    assert.throws(() => reservar(agenda, { ...base, oficinaId: "OAC-LUNA" }, AHORA), { codigo: "OFICINA_DESCONOCIDA" });
    assert.throws(() => reservar(agenda, { ...base, tramiteId: "BODA" }, AHORA), { codigo: "TRAMITE_DESCONOCIDO" });
  });
});
