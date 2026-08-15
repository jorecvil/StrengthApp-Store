# StrengthApp-Store — Explicación del Proyecto

## ¿Qué es?

**Strength Tracker** es una aplicación web + móvil (Android) para gestionar entrenamientos de gimnasio. Funciona 100% offline, sin cuentas ni anuncios.

- **Versión web:** `www/index.html` — app autocontenida (HTML + CSS + JS en un solo archivo) que corre en cualquier navegador.
- **Versión Android:** empaquetada con Capacitor como app nativa para Google Play.

---

## ¿Cómo se creó?

### 1. Base de partida
Se tomó `www2/index.html` (StrengthApp v6.6) — una app web con:
- CRUD manual de semanas, sesiones, ejercicios y series
- RIR/RPE (esfuerzo percibido) y cálculo de 1RM (Epley)
- Historial por ejercicio, récords personales
- Exportación a CSV y JSON
- Backups diarios con fusión de datos
- Merge/Replace de semanas

### 2. Infraestructura Android (Capacitor)
```
npm install @capacitor/core @capacitor/android @capacitor/cli @capacitor/share @capacitor/filesystem
npx cap add android          # Crea proyecto Android base
npx cap sync android         # Copia www/ → android/app/src/main/assets/public/
```

### 3. Firma de la app
- Se generó un keystore de prueba (`keystore/strengthapp-release.jks`)
- Se configuró `signingConfigs.release` en `android/app/build.gradle`
- Se construyó el AAB con `./gradlew bundleRelease`

### 4. Assets de Google Play
- Icono 512×512 (generado con Pillow desde la app web)
- Feature graphic 1024×500 (diseño oscuro con barras de progreso)
- 7 capturas de pantalla (1080×2340) generadas con Chrome headless
- Política de privacidad (`PRIVACY.md`)
- Listing completo (`STORE-LISTING.md`)

---

## Estructura de archivos

```
StrengthApp-Store/
│
├── www/                          # Fuente de la app web
│   └── index.html               # v6.6 — la app completa en 1 archivo
│
├── android/                      # Proyecto Android (Capacitor + Gradle)
│   ├── app/build.gradle         # Config: minSdk 24, targetSdk 36, firma release
│   ├── capacitor.settings.gradle
│   ├── keystore.properties      # ⚠️ NO versionar (apunta a la keystore)
│   ├── gradlew.bat             # Para build en Windows
│   └── gradlew                 # Para build en Linux
│
├── dist/                         # Resultados del build
│   ├── app-release.aab          # Bundle para Google Play (3.2 MB, firmado)
│   └── app-debug.apk           # APK debug para pruebas (4.3 MB)
│
├── keystore/                     # ⚠️ Clave de firma
│   └── strengthapp-release.jks  # RSA 2048, válida 10000 días
│
├── play-assets/                  # Todo para Google Play
│   ├── icon-512x512.png        # Icono de la app
│   ├── feature-graphic-1024x500.png  # Gráfico destacado
│   ├── shot-*.png               # 7 capturas de pantalla
│   ├── PRIVACY.md              # Política de privacidad
│   └── STORE-LISTING.md        # Textos del listing + checklist
│
├── scripts/                      # Utilidades de build
│   ├── setup_env.sh            # Instala JDK + SDK + Node (Linux)
│   └── build_windows.ps1       # Build AAB desde Windows
│
├── capacitor.config.json        # Config: appId com.strength.app
├── package.json                 # Dependencias Capacitor 8
├── .gitignore                   # Excluye keystore, node_modules, builds
├── README.md                    # Documentación técnica
└── status.md                    # Estado del proyecto
```

---

## Problema técnico resuelto: WSL2 ARM64

El equipo usa **Windows ARM64** (Qualcomm Snapdragon) con WSL2 Linux. Esto creó un problema específico:

- **AGP (Android Gradle Plugin)** necesita `aapt2` para empaquetar la app
- `aapt2` de AGP **no tiene build para `linux-aarch64`** (solo `linux-x86_64`)
- WSL2 está en modo **linux-aarch64** → `aapt2` descargado falla con `ENOEXEC`
- No hay `/dev/kvm` → emulador Android x86 no funciona

**Solución:** ejecutar el build en el **host Windows** (que tiene emulación x64 vía Prism), usando el JBR de Android Studio y el SDK de Windows. El script `build_windows.ps1` automatiza esto.

---

## Datos de la app (modelo)

```
┌──────────────┐
│     Week     │  weeks → sessions → exercises → sets
├──────────────┤                  │           │
│ name         │                  │           ├── load (kg)
│ date         │                  │           ├── reps
│ notes        │                  │           ├── rir (0-4)
├──────────────┤                  │           └── notes
│ [sessions]───┼──→ Session       │
└──────────────┘    ├── name      │
                    ├── date      ├── Exercise
                    ├── type      │   ├── name
                    ├── status    │   ├── machine
                    └── notes     │   └── sets[]
                                  │
                    └── [sets]─────┘
```

- **1RM estimado:** fórmula de Epley: `load × (1 + reps/30)`
- **Récords personales:** mejor 1RM histórico por ejercicio
- **Persistencia:** localStorage + backups diarios (últimos 7 días)
- **Importación/Exportación:** JSON completo o por semana

---

## Cómo subir a GitHub (paso a paso)

### 1. Autenticarse con GitHub
```bash
export PATH="$HOME/bin:$PATH"
gh auth login --hostname github.com --git-protocol https --web
```
Abrirá un navegador. Copia el código y autoriza.

### 2. Inicializar el repo
```bash
cd /home/jorecvil/projects/Gimnasio/StrengthApp-Store
git init
git add .
git commit -m "StrengthApp v6.0: web + Android + Play Store assets"
```

### 3. Crear repo en GitHub y subir
```bash
gh repo create StrengthApp-Store --public --source=. --remote=origin --push
```

### 4. Verificar
```bash
gh repo view --web  # Abre el repo en el navegador
```

---

## Cómo publicar en Google Play

1. **Cuenta de desarrollador:** crear en [play.google.com/console](https://play.google.com/console) (25 USD)
2. **Keystore real:** generar tu propia clave (no usar la de prueba):
   ```bash
   keytool -genkeypair -v -keystore keystore/mi-clave.jks -alias mi-app \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
3. **Actualizar `keystore.properties`** con la ruta a tu nueva clave
4. **Rebuild:** `cd android && ./gradlew bundleRelease`
5. **Subir AAB:** arrastrar `dist/app-release.aab` en Play Console → Producción
6. **Ficha:** copiar textos de `play-assets/STORE-LISTING.md`
7. **Capturas reales:** instalar `dist/app-debug.apk` en tu móvil y capturar

---

## Comandos útiles

| Comando | Descripción |
|---|---|
| `python3 -m http.server 4173 --directory www` | Ver la web localmente |
| `npx cap sync android` | Sincronizar www → Android |
| `cd android && ./gradlew bundleRelease` | Build AAB (Linux x86) |
| `powershell -File scripts/build_windows.ps1` | Build AAB (Windows ARM) |
| `npx cap open android` | Abrir en Android Studio |

---

## Licencia / Uso

Proyecto privado del usuario. No usa frameworks externos ni dependencias de terceros más allá de Capacitor (para el empaquetado Android).
