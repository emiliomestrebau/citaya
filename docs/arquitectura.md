# Arquitectura de CitaYa (versión de formación)

```
Navegador ──► GitHub Pages (CDN) ──► index.html + app.js
                                      │
                                      ├─ src/citas.js      dominio (el mismo módulo que prueban las pruebas)
                                      ├─ config/flags.json feature flags (liberar ≠ desplegar)
                                      └─ version.json      qué commit está en producción
```

- **Sin servidor y sin base de datos**: la agenda se guarda en el `localStorage` del navegador. En un sistema real habría una API y una base de datos; aquí lo simplificamos para que el foco esté en el flujo de entrega.
- **Dominio puro** (`src/citas.js`): sin E/S y con el reloj inyectado (`ahora`), así que se puede probar de forma determinista.
- **Configuración fuera del código** (`config/`): los flags cambian el comportamiento sin tocar el código (12 factores, III).
- **Trazabilidad**: `version.json` lleva el SHA del commit; el pie de la web lo muestra y la prueba de humo lo verifica.

## Entornos
| Entorno | Dónde | Quién lo dispara |
|---|---|---|
| Local | `npm start` → http://localhost:8080 | la persona desarrolladora |
| Aceptación | runner efímero de GitHub Actions (`scripts/serve.js`) | cada push y cada PR |
| Producción | GitHub Pages (`github-pages`) | merge a `main` + aprobación manual |
