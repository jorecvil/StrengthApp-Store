# StrengthApp-Store

Versión de lanzamiento de **Strength Tracker**: gestión de entrenamientos de gimnasio (Web + Android vía Capacitor). Offline-first, sin backend, sin anuncios.

Esta carpeta es el resultado de la fusión: base `StrengthApp` v6.6 (`www2/` → `www/`), lista para Google Play.

## Estructura

```
StrengthApp-Store/
├── www/index.html            # App web (v6.6, autocontenida: CSS+JS inline)
├── android/                  # Proyecto Android (Gradle, generado con `cap add android`)
├── capacitor.config.json     # appId com.strength.app, webDir www
├── package.json              # Deps Capacitor 8 (core, android, app, filesystem, share, cli)
├── keystore/                 # ⚠️ NO COMMIT: clave de firma (generar la tuya)
├── dist/
│   ├── app-release.aab       # Bundle firmado para Google Play (v1.0.0)
│   └── app-debug.apk         # APK debug para QA en dispositivo real
└── play-assets/              # Assets de la ficha de Play Store + PRIVACY.md + STORE-LISTING.md
```

## Requisitos de build

- **JDK 21** (o 17) y **Android SDK** con platform 36 y build-tools (AGP 8.13.0).
- **Node ≥22** y Capacitor CLI 8.
- En esta máquina: JDK y SDK instalados en `~/.local/share/jdk-*` y `~/android-sdk` (ver `scripts/setup_env.sh`).

## Comandos

```bash
# Sincronizar web → android (tras editar www/)
npx cap sync android

# Web local (prueba en navegador)
python3 -m http.server 4173 --directory www

# Build release AAB (Linux/x86 o en host Windows via gradlew.bat)
cd android && ./gradlew bundleRelease

# Build debug APK
cd android && ./gradlew assembleDebug
```

> **Nota host ARM64 (WSL2):** aapt2 de AGP no tiene build para linux-aarch64. En este entorno el build se ejecuta en el host Windows con el JBR de Android Studio (ver `scripts/build_windows.ps1`). En un host x86-64 Linux el build es directo.

## Firma

- `android/keystore.properties` (NO versionar) apunta a `../../keystore/strengthapp-release.jks`.
- Regenera tu propia clave: `keytool -genkeypair -v -keystore keystore/strengthapp-release.jks -alias strengthapp -keyalg RSA -keysize 2048 -validity 10000`
- **Guarda la keystore y sus contraseñas en lugar seguro** (perderla = no poder actualizar la app en Play).

## Google Play

Todo el material de la ficha está en `play-assets/`:
- `PRIVACY.md` — política de privacidad (la app no recopila datos).
- `STORE-LISTING.md` — textos de la ficha + checklist de subida.
- Capturas (1080×2340) generadas desde la web con datos demo; se recomienda sustituirlas por capturas reales antes de publicar.

## Datos de la app

- Modelo: `weeks → sessions → exercises → sets` con RIR/RPE y 1RM (Epley).
- Persistencia: localStorage + backups diarios (7 días). Importación/exportación JSON.
- Sin backend: 100% offline. Sin cuentas ni publicidad.
