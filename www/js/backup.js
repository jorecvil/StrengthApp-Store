/**
 * ============================================================================
 * STRENGTH TRACKER — MÓDULO DE BACKUP
 * [SEC-05] Motor de Copias de Seguridad
 * ============================================================================
 */

import { DB_SCHEMA_VERSION, BACKUP_PREFIX, BACKUP_KEEP_COUNT } from './config.js';
import { utils } from './utils.js';

export const backup = {
    auto: () => {
        try {
            const data = utils.load();
            const ts = utils.isoNow();
            const backupKey = `${BACKUP_PREFIX}${ts}`;
            localStorage.setItem(backupKey, JSON.stringify(data));
            const allKeys = Object.keys(localStorage);
            const backupKeys = allKeys.filter(k => k.startsWith(BACKUP_PREFIX)).sort().reverse();
            backupKeys.slice(BACKUP_KEEP_COUNT).forEach(k => localStorage.removeItem(k));
        } catch(e) {
            console.error('Error backup:', e);
        }
    },
    list: () => Object.keys(localStorage)
        .filter(k => k.startsWith(BACKUP_PREFIX))
        .map(k => k.replace(BACKUP_PREFIX, ''))
        .sort()
        .reverse(),
    get: (timestamp) => {
        const data = localStorage.getItem(`${BACKUP_PREFIX}${timestamp}`);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch (e) {
            console.warn('Backup corrupto:', e);
            return null;
        }
    },
    getLatest: () => {
        const timestamps = backup.list();
        if (timestamps.length === 0) return null;
        return backup.get(timestamps[0]);
    },
    /**
     * Valida la integridad de un backup antes de restaurarlo.
     * Lanza error si el backup es corrupto o no tiene schema_version válido.
     */
    validateIntegrity: (data) => {
        if (!data || typeof data !== 'object') throw new Error('Backup corrupto: no es un objeto');
        if (!data.weeks || typeof data.weeks !== 'object') throw new Error('Backup corrupto: falta weeks');
        const schemaVersion = parseInt(data.schema_version, 10);
        if (isNaN(schemaVersion) || schemaVersion < 1) throw new Error('Backup corrupto: schema_version inválido');
        return true;
    },
    download: async (timestamp) => {
        const data = backup.get(timestamp);
        if (!data) return false;
        const backupFile = { backup_meta: { timestamp: timestamp, created_at: new Date().toISOString(), version: String(DB_SCHEMA_VERSION) }, data: data };
        await utils.download(backupFile, `strength_backup_${timestamp.replace(/[:.]/g, '-')}.json`);
        return true;
    },
    downloadAll: async () => {
        const timestamps = backup.list();
        if (timestamps.length === 0) return false;
        const allBackups = timestamps.map(timestamp => ({ timestamp: timestamp, data: backup.get(timestamp) }));
        const exportFile = { export_meta: { created_at: new Date().toISOString(), version: String(DB_SCHEMA_VERSION), total_backups: allBackups.length }, backups: allBackups };
        await utils.download(exportFile, `strength_backups_all_${new Date().toISOString().split('T')[0]}.json`);
        return true;
    },
    restore: async (timestamp, actions, toastFn) => {
        const data = backup.get(timestamp);
        if (!data) { toastFn('⚠️ Backup no encontrado'); return false; }
        if (!confirm(`¿Restaurar backup del ${utils.formatDate(timestamp)}?`)) return false;

        try {
            backup.validateIntegrity(data);
        } catch (e) {
            toastFn(`⚠️ ${e.message}`);
            return false;
        }

        const { setDb } = await import('./data.js');
        backup.auto();
        utils.save(data);
        const newDb = utils.load();
        setDb(newDb);
        toastFn('✓ Backup restaurado');
        await actions.goHome();
        return true;
    }
};
