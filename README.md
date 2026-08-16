# StrengthApp-Store (Strength Tracker)

Aplicación móvil y web de gestión de entrenamientos de fuerza, progresión y cálculo de 1RM. **100% Offline-first, sin backend, sin cuentas y sin publicidad.**

Construida con HTML5/CSS3/JavaScript vanilla y empaquetada para Android con **Capacitor 8**.

---

## 🤖 Generación de Rutinas con Inteligencia Artificial

Strength Tracker es compatible de forma nativa con rutinas generadas por **ChatGPT, Claude, Gemini, DeepSeek** o cualquier otro LLM.

### 📋 Prompt Estándar para tu Asistente de IA

Copia y pega este prompt en tu IA favorita para que diseñe tu semana de entrenamiento en el formato exacto de la app:

```markdown
Actúa como un entrenador personal y metodólogo de fuerza de élite. Diseña un plan de entrenamiento semanal estructurado y devuélvelo ÚNICAMENTE como un bloque de código JSON válido, sin texto introductorio ni explicaciones fuera del JSON, siguiendo estrictamente esta estructura:

{
  "schema_version": "1.0",
  "payload_type": "week",
  "week_ref": {
    "week_id": "2026-W34",
    "week_number": 1,
    "notes": "Estrategia S+1: [Foco Metodológico]. [SALUD]: Estado."
  },
  "sessions": [
    {
      "session_id": "A",
      "title": "Titulo Sesión",
      "goal_summary": "Objetivo (ej: Fuerza máxima o Estrés metabólico)",
      "estimated_duration_min": 60,
      "exercises": [
        {
          "exercise_id": "press_pecho-hammer_strength",
          "name": "Press de Pecho en Máquina",
          "equipment_csv_name": "press_pecho-hammer_strength",
          "machine_name": "Hammer Strength Iso-Lateral Chest Press",
          "pattern": "push_horizontal",
          "recommendations": "Tips técnicos (incluir Tempo si aplica, ej: 3-0-1)",
          "baseline": {
            "set_plan": [
              { "set_index": 1, "reps": 8, "load": 50, "unit": "kg" },
              { "set_index": 2, "reps": 12, "load": 45, "unit": "kg" }
            ]
          }
        },
        {
          "exercise_id": "core_1",
          "name": "Plancha Abdominal",
          "equipment_csv_name": "colchoneta",
          "pattern": "core",
          "baseline": { "planned_sets": 3, "planned_reps": 15, "planned_load": 0 }
        },
        {
          "exercise_id": "opt_1",
          "name": "[OPCIONAL] Elevaciones Laterales",
          "equipment_csv_name": "mancuernas",
          "pattern": "isolation",
          "is_optional": true,
          "baseline": { "planned_sets": 2, "planned_reps": 15, "planned_load": 0 }
        }
      ]
    }
  ]
}
```

### 📥 Cómo cargarlo en la App
1. Copia la respuesta JSON generada por la IA.
2. Abre **Strength Tracker**.
3. Toca **Importar** (en la pantalla de inicio o en el menú).
4. Toca el botón **📋 Pegar desde portapapeles** (o pega el texto directamente).
5. ¡Listo! Tu semana, días, ejercicios, series y cargas quedan cargados al instante.

---

## 📱 Estructura del Proyecto

```
StrengthApp-Store/
├── www/                       # Aplicación Web (Offline-first)
│   ├── index.html             # Bundle autocontenido principal
│   ├── css/styles.css         # Sistema de diseño "Clean Native Athletics"
│   └── js/                    # Módulos ES estructurados (data, logic, ui, actions, etc.)
├── android/                   # Proyecto Android nativo (Capacitor 8)
├── docs/                      # Documentación para GitHub Pages (Privacy Policy, Prompt IA)
├── .github/workflows/         # CI/CD (Lint, Tests, Build AAB, GitHub Pages)
├── play-assets/               # Assets de Google Play (Ficha, iconos, gráficos, capturas)
├── DESIGN.md                  # Especificación del sistema de diseño
└── package.json               # Configuración y dependencias
```

---

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar suite de pruebas (24 tests automatizados)
npm test

# Ejecutar linter
npm run lint

# Sincronizar cambios web con el proyecto Android
npm run sync

# Servir localmente para pruebas web
npm run serve
```

---

## 🚀 Publicación y Google Play

- **Bundle ID:** `com.strength.app`
- **Versión:** `v1.1.0` (`versionCode 2`)
- **Política de Privacidad:** Publicada en `https://jorecvil.github.io/StrengthApp-Store/privacy.html`
- **Ficha de Google Play:** Textos y capturas en `play-assets/STORE-LISTING.md`
- **Build AAB:** Automatizado con GitHub Actions en `.github/workflows/release.yml`
