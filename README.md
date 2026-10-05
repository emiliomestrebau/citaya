# CitaYa · cita previa de la sede electrónica

**Proyecto de prácticas del curso _Estrategia DevOps_ (CLE Formación).**
Ayuntamiento de Villaverde del Río: el ciudadano reserva cita en una oficina de atención para un trámite municipal. Todos los datos son ficticios.

| Laboratorio | Qué harás |
|---|---|
| [LAB 1 · Del backlog al primer cambio con CI](labs/LAB1.md) | Tablero con WIP, historias de usuario, de pruebas y de operaciones, SLO, protección de `main`, un PR que pasa de rojo a verde |
| [LAB 2 · Pipeline de despliegue de punta a punta](labs/LAB2.md) | Commit → build → aceptación → producción → verificación, parar la línea, feature flags, rollback, release y DORA |

**No hace falta instalar nada:** todo se hace desde la web de GitHub (pulsa `.` en el repositorio para abrir el editor `github.dev`).

## Si quieres ejecutarlo en tu equipo (opcional)
Node.js 22 o superior. Sin dependencias.

```bash
npm test                 # lint aparte: npm run lint
npm start                # construye dist/ y lo sirve en http://localhost:8080
```

## Estructura
```
src/citas.js            dominio: franjas, reservas, DNI, cancelación (LAB 1)
public/                 web estática (usa src/citas.js en el navegador)
config/flags.json       feature flags
test/unit/              etapa de commit
test/aceptacion/        etapa de aceptación (contra el artefacto servido)
test/humo/              verificación contra producción
scripts/                build, lint y servidor estático
ops/                    SLO, runbook de continuidad, métricas DORA
.github/                CI, plantillas de historias, plantilla de PR, Dependabot
labs/                   enunciados y el pipeline del LAB 2
docs/arquitectura.md    arquitectura y entornos
```
