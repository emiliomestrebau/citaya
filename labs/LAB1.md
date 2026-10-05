# LAB 1 · Del backlog al primer cambio con CI

**Curso Estrategia DevOps · Día 1 · Módulos 1 y 2**

Eres parte del equipo de **CitaYa**, la cita previa de la sede electrónica del Ayuntamiento de Villaverde del Río. El ciudadano puede reservar cita, pero **no puede cancelarla**: llama por teléfono, la oficina se colapsa y los huecos quedan vacíos. Vas a llevar esa necesidad desde el backlog hasta `main` aplicando lo visto hoy:

| Lo que haces | Lo que estás aplicando |
|---|---|
| Tablero con límites WIP | Gestión visual, flujo, WIP (2.2) |
| Historias de usuario, de pruebas y de operaciones | Requisitos completos, no solo los del usuario final (2.4) |
| `ops/slo.yaml` | SLI, SLO, SLA y error budget (2.4) |
| Regla de protección + check obligatorio | Calidad integrada en el proceso; las Tres Maneras (1.3) |
| CI roja → verde | Feedback rápido; parar la línea |

**Duración orientativa:** 60-75 min. Si no terminas en clase, este enunciado es autosuficiente: termínalo después.
**Necesitas:** una cuenta de GitHub (gratuita) y un navegador. **No hay que instalar nada.**

> ¿Sin cuenta o con la red bloqueada? Sigue la demostración del formador, trabaja en pareja con alguien y haz los pasos 4 y 5 en un documento propio.

---

## Paso 1 · Tu copia del proyecto (5 min)

1. Abre el repositorio del curso (el enlace está en el chat) y pulsa **Fork → Create fork**.
2. En **tu** fork, ve a la pestaña **Actions** y pulsa **"I understand my workflows, go ahead and enable them"**. En los forks, GitHub desactiva los workflows por seguridad.
3. Ve a **Settings → General → Features** y marca **Issues**. En los forks vienen desactivados.

> ⚠️ **Muy importante en los forks:** cuando abras un pull request, comprueba que **base repository** es **tu** fork (`tu-usuario/citaya`) y no el repositorio original. GitHub propone el original por defecto.

## Paso 2 · Ver la etapa de commit (5 min)

1. **Actions → ci → Run workflow → Run workflow** (rama `main`).
2. Entra en la ejecución y abre el job **pruebas**. Fíjate en los pasos *Lint* y *Pruebas unitarias* y en cuánto tarda.

**Pregunta para el chat:** ¿cuánto tarda hoy en tu organización desde que alguien hace commit hasta que sabe si ha roto algo?

## Paso 3 · Tablero de flujo con límites WIP (10 min)

1. En tu fork: pestaña **Projects → New project** (o **Link a project → New project**) → plantilla **Board** → nombre `CitaYa — flujo`.
2. Deja estas columnas, renombrando o añadiendo con **+** las que traiga por defecto:
   `Backlog` · `Listo` · `En curso` · `En revisión` · `Hecho`
3. En **En curso** y **En revisión**: menú **⋯** de la columna → **Set limit → 2**.

¿Por qué? Un límite WIP hace visible el atasco. Cuando una columna está llena, no se empieza nada nuevo: se ayuda a terminar.

## Paso 4 · Tres historias, no una (10 min)

En **Issues → New issue** verás tres plantillas. Crea una de cada:

| Plantilla | Título sugerido | Contenido |
|---|---|---|
| Historia de usuario | `HU-01 · Cancelar mi cita` | Como ciudadano con cita, quiero cancelarla desde la web, para liberar el hueco si no puedo ir |
| Historia de pruebas | `HP-01 · Escenarios de cancelación` | Al menos 3 escenarios Dado/Cuando/Entonces: con antelación, fuera de plazo (< 2 h) y localizador inexistente |
| Historia de operaciones | `HO-01 · Contar cancelaciones` | Como responsable de operación, quiero saber cuántas citas se cancelan, para reasignar ventanillas |

En cada issue, en la barra lateral, ve a **Projects** → `CitaYa — flujo` y déjalas en **Backlog**. Después mueve la HU-01 y la HP-01 a **Listo**.

> Las historias de pruebas y de operaciones son las que más se olvidan. Si las necesidades de quien opera no entran en el backlog, acaban apareciendo como incidentes.

## Paso 5 · El SLO y el error budget (10 min)

Abre `ops/slo.yaml` y completa los `???` (lápiz ✏️ → editar → **Commit changes** directamente en `main`; todavía no está protegida).

- Define el **SLI**: qué mides y de dónde sale el dato.
- Calcula el **error budget** de un SLO del 99,5 % en 30 días.
- Escribe la **política** cuando se agota.

<details>
<summary>Comprueba tu cálculo</summary>

30 días × 24 h × 60 min = 43 200 min · 0,5 % de 43 200 = **216 minutos al mes** (unas 3 h 36 min).
Con el SLA del 99 % el margen sería de 432 min: el SLO más estricto te avisa antes de incumplir con la Concejalía.
</details>

## Paso 6 · Proteger `main` (5 min)

**Settings → Rules → Rulesets → New ruleset → New branch ruleset**

- **Ruleset name:** `proteger-main` · **Enforcement status:** `Active`
- **Target branches → Add target → Include default branch**
- Marca **Require a pull request before merging** (aprobaciones requeridas: 0, porque trabajas solo)
- Marca **Require status checks to pass → Add checks →** escribe `pruebas` y selecciónalo
- **Create**

A partir de ahora nadie, ni siquiera tú, puede llevar a `main` un cambio que no haya pasado las pruebas. **La calidad deja de depender de la buena voluntad.**

## Paso 7 · Primero la prueba: parar la línea (10 min)

1. Mueve **HU-01** a **En curso**.
2. Abre `test/unit/cancelacion.test.js` → lápiz ✏️ → en la línea `describe.skip("HU-01 · cancelar mi cita"` borra **`.skip`**.
3. **Commit changes… → Create a new branch for this commit and start a pull request** → rama `hu-01-cancelar-cita` → **Propose changes**.
4. Abre el pull request (⚠️ base = **tu** fork) y escribe en la descripción `Closes #1` (el número de tu HU-01).
5. Espera al check **pruebas**: **se pone en rojo**. El botón de merge está bloqueado.

Es lo que buscábamos. Las pruebas de la historia de pruebas ya existen y la funcionalidad todavía no. La línea se para y el defecto no avanza.

## Paso 8 · Implementar y llevarlo a `main` (15 min)

1. Abre `src/citas.js` **en la rama `hu-01-cancelar-cita`** (selector de ramas arriba a la izquierda) o pulsa la tecla **`.`** para abrir el editor web `github.dev`.
2. Implementa la función `cancelar()`. Las reglas están en el comentario que tiene encima.
3. Haz commit **en la misma rama**. El PR se actualiza y la CI vuelve a ejecutarse.
4. Cuando **pruebas** esté en verde: **Merge pull request**. El issue HU-01 se cierra solo gracias a `Closes #1`.
5. Mueve la tarjeta a **Hecho**.

<details>
<summary>Pista (inténtalo antes de mirar)</summary>

- Busca la cita con `agenda.citas.find(c => c.localizador === localizador)`.
- Para las horas que faltan: `(momentoDeCita(cita.fecha, cita.hora) - ahora) / 3_600_000`.
- Para lanzar un error de negocio: `throw new ErrorCita("CODIGO", "mensaje")`.
</details>

<details>
<summary>Solución</summary>

```js
export function cancelar(agenda, localizador, ahora = new Date()) {
  const cita = agenda.citas.find(c => c.localizador === localizador);
  if (!cita) throw new ErrorCita("CITA_NO_ENCONTRADA", `No existe la cita ${localizador}`);
  if (cita.estado !== "activa") throw new ErrorCita("CITA_NO_ACTIVA", "La cita ya no está activa");
  const horasQueFaltan = (momentoDeCita(cita.fecha, cita.hora) - ahora) / 3_600_000;
  if (horasQueFaltan < ANTELACION_MIN_CANCELACION_H) {
    throw new ErrorCita("FUERA_DE_PLAZO", `Solo se puede cancelar con ${ANTELACION_MIN_CANCELACION_H} h de antelación`);
  }
  cita.estado = "cancelada";
  cita.canceladaEn = ahora.toISOString();
  return cita;
}
```
</details>

## Paso 9 · Retos (si te sobra tiempo, o en casa)

1. **Lead time:** ¿cuánto pasó desde que creaste el HU-01 hasta que se cerró? Compáralo con el de tu organización.
2. **Caso límite:** en `cancelacion.test.js` hay un `it` comentado. Escríbelo: ¿se puede cancelar **exactamente** 2 h antes? Hazlo con un PR.
3. **Historia de operaciones HO-01:** añade `canceladas` al resultado de `estadisticas()` en `src/citas.js`, con su prueba. Enlaza el PR con `Closes #3`.
4. **Rompe la regla:** intenta hacer commit directo en `main`. ¿Qué pasa?

---

### ✅ Criterio de éxito
- Tablero con límites WIP y las tres historias.
- `ops/slo.yaml` completo con el error budget calculado.
- `main` protegida con el check `pruebas`.
- Un PR **que estuvo en rojo y acabó en verde**, fusionado, con la HU-01 cerrada automáticamente.

**Comparte en el chat:** el enlace a tu PR fusionado y tu error budget en minutos.
