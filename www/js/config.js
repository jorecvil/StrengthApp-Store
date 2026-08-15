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
