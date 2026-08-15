/**
 * ============================================================================
 * STRENGTH TRACKER — MÓDULO DE BACKUP
 * [SEC-05] Motor de Copias de Seguridad
 * ============================================================================
 */

import { DB_SCHEMA_VERSION, BACKUP_PREFIX } from './config.js';
import { utils } from './utils.js';

export const backup = {
    auto: () => {
        try {
            const data = utils.load();
            const today = new Date().toISOString().split('T')[0];
            const backupKey = `${BACKUP_PREFIX}${today}`;
            localStorage.setItem(backupKey, JSON.stringify(data));
            const allKeys = Object.keys(localStorage);
            const backupKeys = allKeys.filter(k => k.startsWith(BACKUP_PREFIX)).sort().reverse();
            backupKeys.slice(5).forEach(k => localStorage.removeItem(k));
        } catch(e) {
            console.error('Error backup:', e);
        }
    },
    list: () => Object.keys(localStorage).filter(k => k.startsWith(BACKUP_PREFIX)).map(k => k.replace(BACKUP_PREFIX, '')).sort().reverse(),
    get: (date) => {
        const data = localStorage.getItem(`${BACKUP_PREFIX}${date}`);
        return data ? JSON.parse(data) : null;
    },
    getLatest: () => {
        const dates = backup.list();
        if (dates.length === 0) return null;
        return backup.get(dates[0]);
    },
    download: async (date) => {
        const data = backup.get(date);
        if (!data) return false;
        const backupFile = { backup_meta: { date: date, created_at: new Date().toISOString(), version: "6.7" }, data: data };
        await utils.download(backupFile, `strength_backup_${date}.json`);
        return true;
    },
    downloadAll: async () => {
        const dates = backup.list();
        if (dates.length === 0) return false;
        const allBackups = dates.map(date => ({ date: date, data: backup.get(date) }));
        const exportFile = { export_meta: { created_at: new Date().toISOString(), version: "6.7", total_backups: allBackups.length }, backups: allBackups };
        await utils.download(exportFile, `strength_backups_all_${new Date().toISOString().split('T')[0]}.json`);
        return true;
    },
    restore: async (date, actions, toastFn) => {
        const data = backup.get(date);
        if (!data) { toastFn('⚠️ Backup no encontrado'); return false; }
        if (!confirm(`¿Restaurar backup del ${utils.formatDate(date)}?`)) return false;
        
        const { setDb } = await import('./data.js');
        utils.save(data);
        const newDb = utils.load();
        setDb(newDb);
        toastFn('✓ Backup restaurado');
        await actions.goHome();
        return true;
    }
};
