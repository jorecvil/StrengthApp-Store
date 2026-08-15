# Ficha de Google Play — Strength Tracker

Contenido listo para pegar en Play Console. Ajusta a tu tono si lo deseas.

## Datos generales

- **Nombre de la app:** Strength Tracker
- **Idioma:** Español
- **Cortas (80 caracteres máx):**
  `Planifica, entrena y analiza tu fuerza. Offline, gratis y sin anuncios.`
- **Largas (4000 caracteres máx):**

```
Strength Tracker es tu cuaderno de entrenamiento de fuerza, offline y sin anuncios.

PLANIFICA
Crea tus semanas y sesiones manualmente o importa rutinas en formato JSON. Cada sesión define ejercicios, máquinas y el plan de series, repeticiones y carga.

ENTRENA
Durante la sesión registras cada serie con su carga real, repeticiones y valoración de esfuerzo (RIR/RPE 0-4). Añade series extra, notas por serie y no te pierdas con el temporizador de descanso y el bloqueo de pantalla activo.

ANALIZA
La app estima tu 1RM con la fórmula de Epley, detecta tus récords personales y muestra el resumen mensual y los últimos 30 días. Consulta el histórico completo por ejercicio y exporta todo a CSV o JSON.

RESPALDA
Respaldo automático diario, fusión o reemplazo de datos y exportación nativa para tu carpeta o menú de compartir. Todo se guarda únicamente en tu dispositivo.

POR QUÉ STRENGTH TRACKER
- 100% offline: tus datos nunca salen de tu móvil.
- Sin cuentas, sin publicidad, sin suscripciones.
- Compatible con la importación de rutinas generadas por asistentes de IA mediante JSON.
- Diseño limpio y oscuro ideal para el gimnasio.

Descárgala gratis y empieza a seguir tu progreso hoy mismo.
```

## Categoría
- **Categoría:** Salud y estado físico
- **Etiqueta:** Fitness / Entrenamiento de fuerza

## Gráficos (listos en `play-assets/`)
| Asset | Archivo |
|---|---|
| Icono de la app (512×512) | `icon-512x512.png` |
| Imagen destacada (1024×500) | `feature-graphic-1024x500.png` |
| Capturas de pantalla móvil (1080×2340) | `shot-home.png`, `shot-week.png`, `shot-session.png`, `shot-exercise.png`, `shot-history.png`, `shot-exercise_history.png`, `shot-backups.png` |

> **Nota:** las capturas se generaron desde la versión web con datos de demostración. Antes de publicar, se recomienda sustituirlas por capturas reales del dispositivo para mostrar la ficha con la máxima fidelidad. Para ello instala `dist/app-debug.apk`, carga datos reales y captura en tu móvil.

## Declaración de datos (Data safety)
- **Tipo:** La app **no recopila ni comparte datos**.
- Se declara como: no se recopila ningún tipo de dato (personal, financiero, ubicación, actividad, identificadores...).
- **Sin** permisos sensibles. Único permiso declarado: INTERNET (no usado para transmisión de datos del usuario).
- **Sin** cifrado en tránsito necesario (no hay tránsito).
- **Sin** petición de borrado de datos (no hay datos fuera del dispositivo).

## Clasificación de contenido (IARC)
- No contiene violencia, contenido sexual, drogas ni compras in-app. Clasificación esperada: **3+ (Todos)**.

## Versión / App bundle
- Archivo a subir: `dist/app-release.aab`
- versionCode: `1`, versionName: `1.0`
- targetSdk: 36, minSdk: 24

## Cuenta de desarrollador
- Necesitas una cuenta de desarrollador de Google Play (pago único de 25 USD) en https://play.google.com/console
- Acepta el Acuerdo de distribución para desarrolladores y completa el formulario de contacto.

## Pasos de subida (resumen)
1. Play Console → **Crear app** → nombre + idioma + gratis.
2. Configurar la **ficha de la tienda**: corta, larga, capturas, icono, imagen destacada.
3. **Clasificación de contenido** → completar cuestionario.
4. **Usuarios objetivo** → declaraciones de publicidad (ninguna) y política de privacidad (enlazar a `PRIVACY.md` publicado en una URL pública).
5. **Subir la versión** → arrastrar `app-release.aab` (release de producción, firma con la upload key).
6. Revisar en **Producción** → la consola validará el bundle → **Enviar para revisión**.
