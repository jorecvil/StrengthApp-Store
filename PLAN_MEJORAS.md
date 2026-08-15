# Plan de mejora — Strength Tracker

## Prioridad 0 — Antes de publicar en Google Play

1. Sustituir la clave de firma de ejemplo por una upload key propia y aumentar `versionCode` en cada AAB.
2. Corregir la ficha de Play: no prometer temporizador hasta implementarlo, describir RIR (no RPE) y publicar la política de privacidad en una URL pública.
3. Decidir la política de copias Android: desactivar `allowBackup` o establecer reglas explícitas coherentes con la privacidad.
4. Hacer QA en dispositivo físico: importación, series, historial, exportación, restauración y navegación Atrás por botón y gesto.

## Prioridad 1 — Integridad y seguridad de datos

1. Renderizar texto importado de forma segura: sin interpolar datos en `innerHTML` ni `onclick`; usar `textContent` y listeners.
2. Validar completamente semanas, sesiones, ejercicios y series al importar; limitar tamaño de archivo y rangos numéricos.
3. Mejorar el merge con IDs y fechas de modificación por entidad; conservar ambos cambios o pedir resolver conflictos.
4. Versionar el esquema de datos, incluir migraciones y recuperarse de JSON corrupto o de cuota agotada.
5. Conservar copias con fecha y hora y exportar antes de sobrescrituras destructivas.

## Prioridad 2 — Experiencia de entrenamiento

1. Mantener el Atrás nativo y permitir volver con deslizamiento desde el borde izquierdo, sin afectar campos, botones ni modales.
2. Incorporar temporizador de descanso configurable, con pausa, reinicio y notificación opcional.
3. Acelerar el registro: duplicar series, usar último set válido y admitir ejercicios de peso corporal.
4. Añadir etiquetas accesibles, foco visible y validación de contraste.

## Prioridad 3 — Calidad técnica

1. Separar el HTML único en datos, lógica, analítica, UI, estilos y adaptadores Capacitor.
2. Añadir pruebas para 1RM, validación, importación, merge, backups y navegación; sustituir los tests plantilla.
3. Automatizar lint, pruebas, sincronización Capacitor y creación verificable del AAB.

## Secuencia recomendada

1. Firma, versión, ficha y QA de Play.
2. Seguridad del renderizado, validación y merge.
3. Backups versionados y pruebas.
4. Temporizador, accesibilidad y productividad.
5. Modularización y automatización.

## Criterios de aceptación

- Un JSON importado no ejecuta código ni rompe la interfaz.
- La fusión conserva los cambios de ambos dispositivos o solicita una decisión.
- Se puede volver desde cualquier vista con Atrás sin perder datos confirmados.
- El AAB usa una clave del propietario y un `versionCode` superior al de la entrega anterior.
