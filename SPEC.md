# Implementación: analítica de fuerza y temporadas

> Estado: implementada en el worktree, pendiente de pruebas manuales antes de commit/release.

## Objetivo

Entregar la analítica y temporadas de `SPEC_ANALITICA_Y_TEMPORADAS.md` en una única aplicación ejecutable desde módulos bundleados, preservando los datos existentes.

## Decisiones confirmadas

- El bundle generado desde `www/js/app.js` sustituye al JavaScript inline.
- Las sesiones incluyen `scheduled_date` para el cálculo de adherencia.
- Los límites de temporadas se calculan con fechas locales `YYYY-MM-DD` del dispositivo.
- En conflictos de temporada con el mismo identificador, gana el `modified_at` más reciente.

## Criterios de aceptación

- La app carga desde un bundle generado y no contiene runtime inline duplicado.
- La migración v2 a v3 es idempotente, conserva semanas y añade `seasons`, `scheduled_date` y `rir_is_open_ended: false` donde corresponda.
- Importación, backup, restauración y merge preservan temporadas y los nuevos campos.
- `80 x 8 @2` calcula e1RM ajustado con 10 repeticiones efectivas; `4+` no se procesa como RIR 4 exacto.
- Las variantes con máquina/equipo distinto no comparten récord, tendencia ni tonelaje.
- Análisis abre una vista propia con filtros, métricas, estados vacíos accesibles y datos de gráficas SVG.
- Solo puede haber una temporada activa; cerrar o eliminar una temporada no modifica entrenamiento.
- La adherencia se calcula con sesiones completadas y `scheduled_date` dentro del periodo.
- Exportaciones de variante y temporada incluyen los nuevos datos.

## Estrategia de pruebas

- Pruebas unitarias para migración, RIR, e1RM, variante, periodos, adherencia y temporadas.
- Pruebas de importación, backup y merge para schema v3.
- `npm run verify`, `npm run sync` y `python3 /home/jorecvil/scripts/core/compliance_checker.py .` deben pasar antes de cerrar.

## Estado técnico actual

- Runtime único: `www/index.html` carga `www/dist/app.js`, generado con `npm run build` desde `www/js/app.js`.
- Schema v3: migración idempotente de `seasons`, `scheduled_date` y `rir_is_open_ended`.
- La analítica opera por exposición de sesión y `exercise_key`; historial, récords y exportaciones no mezclan máquinas.
- Los eventos de UI usan dispatcher delegado; no hay atributos inline `on*` ni APIs internas expuestas en `window`.
- `npm test` ejecuta seguridad, analítica, RIR, temporadas y la comprobación anti-inline. La suite heredada `tests/test_security_merge.js` queda fuera porque depende del runtime inline eliminado y requiere migración independiente.
