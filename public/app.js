// Interfaz de CitaYa en el navegador. La lógica vive en src/citas.js (la misma que prueban las pruebas).
import { OFICINAS, TRAMITES, crearAgenda, reservar, cancelar, disponibilidad } from "./src/citas.js";

const CLAVE = "citaya.agenda";
const $ = id => document.getElementById(id);

function cargarAgenda() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || crearAgenda(); } catch { return crearAgenda(); }
}
function guardarAgenda(agenda) {
  try { localStorage.setItem(CLAVE, JSON.stringify(agenda)); } catch { /* modo privado: se pierde al recargar */ }
}
function mensaje(el, texto, tipo) {
  el.textContent = texto;
  el.className = `mensaje ${tipo || ""}`;
}

async function cargarJson(ruta, porDefecto) {
  try {
    const r = await fetch(ruta, { cache: "no-store" });
    return r.ok ? await r.json() : porDefecto;
  } catch { return porDefecto; }
}

const agenda = cargarAgenda();
const flags = await cargarJson("config/flags.json", {});

$("tramite").innerHTML = TRAMITES.map(t => `<option value="${t.id}">${t.nombre}</option>`).join("");
$("oficina").innerHTML = OFICINAS.map(o => `<option value="${o.id}">${o.nombre}</option>`).join("");

// Por defecto, el siguiente día laborable.
const manana = new Date();
do { manana.setDate(manana.getDate() + 1); } while ([0, 6].includes(manana.getDay()));
$("fecha").value = manana.toISOString().slice(0, 10);

function pintarHoras() {
  const libres = disponibilidad(agenda, $("oficina").value, $("fecha").value).filter(f => f.libres > 0);
  $("hora").innerHTML = libres.length
    ? libres.map(f => `<option value="${f.hora}">${f.hora} (${f.libres} libre${f.libres > 1 ? "s" : ""})</option>`).join("")
    : `<option value="">Sin huecos</option>`;
}
["oficina", "fecha"].forEach(id => $(id).addEventListener("change", pintarHoras));
pintarHoras();

$("form-reserva").addEventListener("submit", e => {
  e.preventDefault();
  try {
    const cita = reservar(agenda, {
      oficinaId: $("oficina").value, tramiteId: $("tramite").value,
      fecha: $("fecha").value, hora: $("hora").value, dni: $("dni").value,
    });
    guardarAgenda(agenda);
    mensaje($("msg-reserva"), `Cita reservada. Localizador: ${cita.localizador}`, "ok");
    pintarHoras();
  } catch (err) {
    mensaje($("msg-reserva"), err.message, "error");
  }
});

// Feature flag "listaEspera": el código ya está desplegado; el flag decide si se libera al ciudadano.
$("lista-espera").hidden = !flags.listaEspera;

$("btn-espera").addEventListener("click", () => {
  mensaje($("msg-reserva"), "Te avisaremos si se libera un hueco ese día.", "ok");
});

$("form-cancelar").addEventListener("submit", e => {
  e.preventDefault();
  try {
    const cita = cancelar(agenda, $("localizador").value.trim());
    guardarAgenda(agenda);
    mensaje($("msg-cancelar"), `Cita ${cita.localizador} cancelada.`, "ok");
    pintarHoras();
  } catch (err) {
    mensaje($("msg-cancelar"), err.message, "error");
  }
});

$("enlace-clasico").hidden = !flags.formularioClasico;

const v = await cargarJson("version.json", null);
if (v) $("version").textContent = `v${v.version} · ${String(v.sha).slice(0, 7)}`;
