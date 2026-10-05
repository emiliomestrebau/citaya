# LAB 2 · Pipeline de despliegue de punta a punta

**Curso Estrategia DevOps · Día 2 · Módulos 3, 4 y 5**

Ayer CitaYa ganó la cancelación de citas, pero nadie la ve: **no está desplegada**. Hoy construyes el pipeline que lleva cada cambio de `main` hasta producción (GitHub Pages) de forma repetible, con una puerta de calidad en cada etapa, y lo usas para lo que de verdad importa: parar un defecto, liberar una funcionalidad con un flag, volver atrás y medir.

```
 1 · commit  ─►  2 · build  ─►  3 · aceptación  ─►  4 · producción  ─►  5 · verificación
 lint + unit     artefacto      pruebas sobre el     aprobación +        humo contra la
                 dist (una vez) MISMO artefacto      GitHub Pages        URL pública
```

| Lo que haces | Lo que estás aplicando |
|---|---|
| Un único artefacto que recorre todas las etapas | *Build once, deploy many* (3.2) |
| Aprobación manual antes de producción | Entrega continua frente a despliegue continuo (3.1) |
| La aceptación para un cambio dañino | Ji-Kotei-Kanketsu, Jidoka, parar la línea (3.3) |
| Feature flag | Desplegar ≠ liberar; configuración fuera del código (4.2) |
| *Revert* y redespliegue | Recuperación, MTTR (4.4) |
| Release `v1.0.0` | Control de versiones y versionado semántico (4.2) |
| `ops/dora.md` | Medir el flujo: métricas DORA (1.1) |
| Retirar el formulario clásico | Fin de la vida útil (5) |

**Duración orientativa:** 50-90 min. Puede alargarse y no pasa nada: el enunciado es autosuficiente.
**Requisito:** haber hecho al menos los pasos 1, 6 y 8 del LAB 1. Si no los hiciste, haz el fork, habilita Actions y aplica la solución del paso 8 del LAB 1 directamente en `main`.

---

## Paso 1 · Preparar producción (5 min)

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. **Settings → Environments**. Si no existe, **New environment** con el nombre exacto `github-pages`.
3. Entra en `github-pages` → marca **Required reviewers** → añádete a ti → **Save protection rules**.
   (Deja **sin marcar** "Prevent self-review": trabajas solo).

Acabas de poner una **puerta manual** antes de producción. Con ella tienes **entrega continua**: siempre listo para desplegar, y una persona decide cuándo. Sin ella sería **despliegue continuo**.

## Paso 2 · Crear el pipeline (10 min)

1. Abre `labs/dia2/pipeline.yml` y copia todo su contenido (botón **Copy raw file**).
2. **Add file → Create new file** → nombre: `.github/workflows/pipeline.yml` → pega.
3. **Commit changes… → Create a new branch** `pipeline` → **Propose changes** → abre el PR (⚠️ base = **tu** fork).
4. En el PR verás ejecutarse **1 · commit → 2 · build → 3 · aceptación**. En un PR el pipeline **no** pasa a producción: mira la condición `if:` del job `produccion`.
5. Cuando esté en verde: **Merge**.

Lee el YAML con calma. Fíjate en tres cosas:
- `needs:` encadena las etapas: si una falla, las siguientes no se ejecutan.
- `upload-artifact` / `download-artifact`: el `dist` que se prueba es **el mismo** que se despliega.
- `concurrency:` impide dos despliegues a la vez.

## Paso 3 · Primer despliegue (10 min)

1. **Actions → pipeline** → la ejecución de `main` que lanzó el merge.
2. Al llegar a **4 · producción** se queda en **Waiting**: **Review deployments → github-pages → Approve and deploy**.
3. Cuando **5 · verificación** esté en verde, abre la URL que aparece en el job de producción (`https://tu-usuario.github.io/citaya/`).
4. Reserva una cita y cancélala con su localizador: es tu código del LAB 1 en producción.
5. Mira el pie de la página: muestra la **versión y el SHA** del commit. Compáralo con el último commit de `main`.

## Paso 4 · Parar la línea (15 min)

Negocio pide por correo: *"En horario de verano cerramos a las 13:00, cambiadlo"*.

1. Abre `src/citas.js` → lápiz ✏️ → cambia `HORA_CIERRE = 14` por `HORA_CIERRE = 13`.
2. **Create a new branch** `horario-verano` → PR.
3. Observa: **pruebas** ✅ · **1 · commit** ✅ · **2 · build** ✅ · **3 · aceptación** ❌.
   Lee el error: *"Solo hay 16 franjas al día: se incumple la capacidad mínima comprometida (20)"*.
4. **¿Puedes hacer merge?** Probablemente sí, porque tu ruleset solo exige `pruebas`. Corrígelo: **Settings → Rules → Rulesets → proteger-main → Require status checks → Add checks →** `3 · aceptación` → **Save changes**. Vuelve al PR: ahora el merge está bloqueado.
5. Cierra el PR sin fusionar (**Close pull request**) y borra la rama.

**Para pensar:** las unitarias no lo detectaron, porque el código hacía exactamente lo que se le pedía. Lo detectó la prueba que codifica **el compromiso con el servicio** (historia de pruebas + SLA). Eso es **Ji-Kotei-Kanketsu**: cada etapa conoce su criterio de "bien hecho" y no pasa el defecto a la siguiente. ¿Qué habría pasado con un despliegue manual de viernes por la tarde?

## Paso 5 · Desplegar no es liberar: feature flag (10 min)

El código de la **lista de espera** ya está en producción, pero apagado.

1. Abre `config/flags.json` → cambia `"listaEspera": false` por `true` → rama `activar-lista-espera` → PR → merge cuando esté en verde.
2. En **Actions**, aprueba el despliegue.
3. Recarga la web: aparece **"Apuntarme a la lista de espera"**. No has tocado ni una línea de código.

## Paso 6 · Algo va mal: rollback (10 min)

La Concejalía avisa: *"la lista de espera no estaba aprobada, quitadla ya"*. **Anota la hora.**

1. Ve al PR fusionado `activar-lista-espera` → botón **Revert** → **Create pull request** → merge.
2. Aprueba el despliegue y espera a **5 · verificación** en verde. **Anota la hora.**
3. La diferencia entre las dos horas es tu **tiempo de recuperación** (MTTR).

Fíjate en que no has "deshecho" nada a mano en el servidor. La vuelta atrás es **otro cambio** que recorre el mismo pipeline, con las mismas pruebas, y queda registrado.

## Paso 7 · Versionar (5 min)

1. **Releases → Draft a new release → Choose a tag** → escribe `v1.0.0` → **Create new tag**.
2. **Generate release notes** → revisa → **Publish release**.
3. Opcional: actualiza `version` en `package.json` a `1.0.0` y el `CHANGELOG.md` con un PR. ¿Qué número tocarías (MAJOR.MINOR.PATCH) por añadir la cancelación? ¿Y por un arreglo?

## Paso 8 · Medir: DORA (10 min)

Completa `ops/dora.md` con los datos de **Actions → pipeline**:
- Frecuencia de despliegue · lead time de cambios · tasa de fallo de cambios · tiempo de recuperación.
- ¿Cuál es tu peor métrica y qué harías para mejorarla?

---

## Paso 9 · Retos (si te sobra tiempo, o en casa)

### A · Fin de la vida útil: retirar el formulario clásico (Módulo 5)
`clasico.html` es un formulario heredado de 2014, marcado como obsoleto en el `CHANGELOG`.
1. **Apagar:** `formularioClasico` a `false` en `config/flags.json` → PR → despliegue. El enlace desaparece, pero la página sigue existiendo para quien la tenga guardada.
2. **Observar:** en un sistema real, aquí se mide el uso durante un tiempo acordado. Escribe en el PR qué métrica usarías para decidir que ya se puede borrar.
3. **Retirar:** borra `public/clasico.html`, el párrafo `enlace-clasico` de `public/index.html`, su línea en `public/app.js` y el flag en `config/flags.json` → PR.
4. **Documentar:** en `CHANGELOG.md`, sección **Eliminado**. Sube la versión: ¿es MAJOR?

### B · Continuidad de negocio (4.4)
Completa `ops/runbook-continuidad.md`: RTO, RPO y los pasos para recuperar el servicio redesplegando un artefacto anterior (**Actions → ejecución → Re-run jobs**).

### C · Dependencias (4.1)
**Settings → Code security → Dependabot version updates → Enable**. El archivo `.github/dependabot.yml` ya existe: Dependabot propondrá PR para actualizar las acciones del pipeline. Cada uno pasará por el mismo pipeline antes de llegar a producción.

### D · Despliegue continuo
Quita **Required reviewers** del entorno `github-pages`. ¿Qué tendría que ser cierto en tu organización para atreverte a hacerlo en un sistema real?

---

### ✅ Criterio de éxito
- CitaYa publicada en tu GitHub Pages, con el SHA en el pie.
- Un PR **bloqueado por la etapa de aceptación** y `3 · aceptación` añadido como check obligatorio.
- Un flag activado y revertido, con tu MTTR medido.
- La release `v1.0.0` y `ops/dora.md` completo.

**Comparte en el chat:** tu URL de GitHub Pages y tu MTTR.
