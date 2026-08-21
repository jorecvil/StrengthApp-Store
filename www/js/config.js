/**
 * ============================================================================
 * STRENGTH TRACKER — MÓDULO DE CONFIGURACIÓN
 * [SEC-01] Constantes & Configuración Global
 * ============================================================================
 */

// Claves de localStorage
export const STORE_KEY = 'strength_app_v6_data';
export const THEME_KEY = 'strength_app_theme';
export const BACKUP_PREFIX = 'strength_app_backup_';
export const DB_SCHEMA_VERSION = 2;
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024; // 5 MB

// Validación de identificadores (IDs de semana/sesión/ejercicio)
// Solo permite alfanuméricos, guiones y guiones bajos para evitar inyección en atributos.
export const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
export const MAX_ID_LENGTH = 64;

// Copias de seguridad: número máximo de backups conservados (con timestamp completo)
export const BACKUP_KEEP_COUNT = 10;

// Umbrales de cuota de localStorage (aprox. 5 MB típico)
export const LOCALSTORAGE_QUOTA_WARN = 4 * 1024 * 1024; // 4 MB advertencia
export const LOCALSTORAGE_QUOTA_MAX = 5 * 1024 * 1024;  // 5 MB límite duro

// Plantilla estándar de Prompt para generar rutinas con LLMs (ChatGPT, Claude, Gemini)
export const LLM_PROMPT_TEMPLATE = `Actúa como un entrenador personal y metodólogo de fuerza de élite. Diseña un plan de entrenamiento semanal estructurado y devuélvelo ÚNICAMENTE como un bloque de código JSON válido, sin texto introductorio ni explicaciones fuera del JSON, siguiendo estrictamente esta estructura:

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
}`;

// Memoria RIR en sesión (módulo para mantener estado efímero)
export let lastRIR = null;

// Bloqueo de pantalla durante el entrenamiento
export const wakeLock = {
    lock: null,
    request: async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLock.lock = await navigator.wakeLock.request('screen');
            } catch (err) {
                console.warn('Wake Lock no disponible:', err);
            }
        }
    },
    release: async () => {
        if (wakeLock.lock) {
            try {
                await wakeLock.lock.release();
            } catch (err) {
                console.warn('Error al liberar WakeLock:', err);
            }
            wakeLock.lock = null;
        }
    }
};
