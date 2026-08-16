---
layout: default
title: "Generación de Rutinas con IA (Prompt y Plantilla)"
---

# Generación de Rutinas con Inteligencia Artificial

**Strength Tracker** permite importar semanas de entrenamiento diseñadas directamente por modelos de lenguaje como **ChatGPT, Claude, Gemini o DeepSeek**.

---

## 📋 Prompt y Plantilla JSON Estándar

Copia el siguiente bloque y pégalo en tu asistente de IA para que cree tu rutina semanal estructurada:

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

---

## 🚀 Pasos para Importar en tu Móvil

1. **Genera tu rutina:** Envía el prompt a ChatGPT o Claude junto con tus objetivos personales (ej: *"Mi objetivo es hipertrofia en torso, tengo 4 días disponibles"*).
2. **Copia el JSON:** Copia únicamente el bloque de código generado.
3. **Pega en la App:** Abre **Strength Tracker** → Toca **Importar** → Toca **📋 Pegar desde portapapeles**.
4. ¡Listo! Tu rutina queda guardada y lista para entrenar sin conexión a internet.

---

[← Volver al Inicio](index.html) · [Política de Privacidad](privacy.html)
