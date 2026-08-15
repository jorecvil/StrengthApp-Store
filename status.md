# STATUS — StrengthApp-Store

**Fecha:** 2026-08-15 · **Estado:** PREPARADA PARA GOOGLE PLAY (v1.0.0) · **Analizado por:** opencode

## Resumen
Carpeta nueva creada para publicar **Strength Tracker** (gestión de entrenamientos gym) en Google Play, manteniendo una única base web que funciona en navegador y Android vía Capacitor. Base: `StrengthApp` v6.6 (`www2/`).

## Artefactos entregados

| Artefacto | Ruta | Estado |
|---|---|---|
| Web app v6.6 | `www/index.html` | ✅ Funcional standalone (verificada con Chrome headless) |
| Proyecto Android | `android/` | ✅ Regenerado limpio (sin artefactos Windows) |
| **AAB release firmado** | `dist/app-release.aab` (3,2 MB) | ✅ BUILD SUCCESSFUL · jarsigner verified · contiene v6.6 |
| APK debug (QA) | `dist/app-debug.apk` (4,3 MB) | ✅ BUILD SUCCESSFUL |
| Keystore firma | `keystore/strengthapp-release.jks` | ✅ RSA 2048, validez 10000 días |
| Icono Play 512² | `play-assets/icon-512x512.png` | ✅ |
| Feature graphic 1024×500 | `play-assets/feature-graphic-1024x500.png` | ✅ |
| 7 capturas 1080×2340 | `play-assets/shot-*.png` | ✅ Generadas desde web con datos demo |
| Política privacidad | `play-assets/PRIVACY.md` | ✅ (offline, sin datos) |
| Ficha Play + checklist | `play-assets/STORE-LISTING.md` | ✅ |
| Scripts build | `scripts/setup_env.sh`, `build_windows.ps1` | ✅ |
| README | `README.md` | ✅ |

## Identidad
- **appId:** `com.strength.app` · **appName:** "Strength Tracker"
- **versionCode:** 1 · **versionName:** 1.0 · targetSdk 36 · minSdk 24
- Permisos: solo `INTERNET` (sin transmisión de datos de usuario)

## Solución técnica clave
- **WSL2 ARM64**: aapt2 de AGP no tiene build linux-aarch64 → el build se ejecutó **en el host Windows** (ARM64 con emulación x64 vía Prism) usando el JBR de Android Studio y el SDK Windows. Documentado en `README.md` y `build_windows.ps1`.

## Firma
- `android/keystore.properties` (gitignored) → `../../keystore/strengthapp-release.jks`.
- **⚠️ Acción obligatoria antes de publicar:** el keystore actual usa credenciales de ejemplo (`Caf12345!`). Debes generar tu propia clave y conservarla en lugar seguro (perderla impide futuras actualizaciones de la app en Play).

## Checklist pendiente (solo en Play Console)
1. Crear cuenta de desarrollador (25 USD único).
2. Crear app → rellenar ficha con `play-assets/STORE-LISTING.md`.
3. Subir `dist/app-release.aab` (firma de producción).
4. Cuestionario de clasificación de contenido (esperado: 3+).
5. Declaración de datos: **no recopila datos**.
6. Enlazar política de privacidad (`PRIVACY.md`) en URL pública.
7. **Recomendado:** sustituir capturas demo por capturas reales desde el APK debug antes de publicar.

## QA manual sugerido
Instalar `dist/app-debug.apk` en dispositivo real:
1. Importar una semana JSON (botón Importar) y verificar render en Semana.
2. Crear semana vacía y sesión → añadir ejercicio.
3. Abrir ejercicio → registrar series con RIR → ver badge de sets.
4. Finalizar sesión → ver reporte JSON.
5. Historial → comprobar 1RM (Epley), récords y export CSV/JSON.
6. Backups → fusionar y restaurar.

## Veredicto
**Carpeta lista para publicación.** La parte de código/entorno está completa y verificada. Solo quedan acciones manuales del propietario (cuenta Play, ficha, firma definitiva y capturas reales).
