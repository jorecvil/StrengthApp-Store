/**
 * ============================================================================
 * STRENGTH TRACKER — MÓDULO DE UTILIDADES Y SANITIZACIÓN
 * [SEC-03] Utilidades, Sanitización & Almacenamiento
 * ============================================================================
 */

import { STORE_KEY, DB_SCHEMA_VERSION, BACKUP_PREFIX } from './config.js';

export const utils = {
    esc: (str) => {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/`/g, '&#96;');
    },
    encodeParam: (str) => {
        return encodeURIComponent(String(str === null || str === undefined ? '' : str))
            .replace(/'/g, '%27')
            .replace(/"/g, '%22')
            .replace(/\\/g, '%5C');
    },
    decodeParam: (str) => {
        try {
            return decodeURIComponent(str || '');
        } catch (e) {
            console.warn('Error al decodificar parámetro:', e);
            return str || '';
        }
    },
    uuid: () => Date.now().toString(36) + Math.random().toString(36).substring(2, 10),
    isoNow: () => new Date().toISOString(),
    formatDate: (isoString) => {
        if (!isoString) return '-';
        try {
            const d = new Date(isoString);
            if (isNaN(d.getTime())) return '-';
            return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) {
            console.warn('Error al formatear fecha:', e);
            return '-';
        }
    },
    formatMonth: (monthKey) => {
        try {
            if (!monthKey || typeof monthKey !== 'string') return '-';
            const [year, month] = monthKey.split('-');
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const idx = parseInt(month, 10) - 1;
            if (idx >= 0 && idx < 12) {
                return `${months[idx]} ${year}`;
            }
            return monthKey;
        } catch (e) {
            console.warn('Error formateando mes:', e);
            return monthKey || '-';
        }
    },
    save: (data, backupAuto) => {
        try {
            data.schema_version = DB_SCHEMA_VERSION;
            data.modified_at = utils.isoNow();
            localStorage.setItem(STORE_KEY, JSON.stringify(data));
            if (backupAuto) backupAuto();
            return true;
        } catch (e) {
            console.error('Error al guardar en localStorage:', e);
            try {
                const keys = Object.keys(localStorage).filter(k => k.startsWith(BACKUP_PREFIX)).sort();
                if (keys.length > 2) {
                    keys.slice(0, keys.length - 2).forEach(k => localStorage.removeItem(k));
                    localStorage.setItem(STORE_KEY, JSON.stringify(data));
                    return true;
                }
            } catch (retryErr) {
                console.error('Reintento de guardado fallido:', retryErr);
            }
            return false;
        }
    },
    load: () => {
        const raw = localStorage.getItem(STORE_KEY);
        if (!raw) {
            return { schema_version: DB_SCHEMA_VERSION, weeks: {}, created_at: utils.isoNow(), modified_at: utils.isoNow() };
        }
        try {
            const data = JSON.parse(raw);
            return utils.migrateSchema(data);
        } catch (e) {
            console.error('Datos corruptos en localStorage:', e);
            return { schema_version: DB_SCHEMA_VERSION, weeks: {}, created_at: utils.isoNow(), modified_at: utils.isoNow() };
        }
    },
    migrateSchema: (data) => {
        if (!data || typeof data !== 'object') {
            return { schema_version: DB_SCHEMA_VERSION, weeks: {}, created_at: utils.isoNow(), modified_at: utils.isoNow() };
        }
        if (!data.weeks || typeof data.weeks !== 'object') {
            data.weeks = {};
        }
        if (!data.schema_version || data.schema_version < 2) {
            data.schema_version = 2;
            data.created_at = data.created_at || utils.isoNow();
            data.modified_at = utils.isoNow();
            Object.values(data.weeks).forEach(w => {
                if (!w.week) w.week = { week_id: utils.uuid(), week_number: 1 };
                w.week.modified_at = w.week.modified_at || w.generated_at || utils.isoNow();
                if (!Array.isArray(w.sessions)) w.sessions = [];
                w.sessions.forEach(s => {
                    s.modified_at = s.modified_at || utils.isoNow();
                    if (!Array.isArray(s.exercises)) s.exercises = [];
                    s.exercises.forEach(e => {
                        e.modified_at = e.modified_at || utils.isoNow();
                        if (!e.execution) e.execution = { sets: [] };
                        if (!Array.isArray(e.execution.sets)) e.execution.sets = [];
                    });
                });
            });
            try {
                localStorage.setItem(STORE_KEY, JSON.stringify(data));
            } catch (err) {
                console.warn('No se pudo guardar la migración inmediatamente:', err);
            }
        }
        return data;
    },
    download: async (data, filename) => {
        const text = JSON.stringify(data, null, 2);
        if (window.Capacitor && Capacitor.isNativePlatform()) {
            const { Filesystem, Share } = Capacitor.Plugins;
            try {
                await Filesystem.writeFile({ path: filename, data: text, directory: 'CACHE', encoding: 'utf8' });
                const uriResult = await Filesystem.getUri({ directory: 'CACHE', path: filename });
                await Share.share({ title: 'Backup Strength Tracker', files: [uriResult.uri] });
            } catch (e) {
                console.warn('Error en Filesystem/Share nativo:', e);
                navigator.clipboard.writeText(text);
            }
        } else {
            const blob = new Blob([text], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    },
    downloadCSV: async (csv, filename) => {
        if (window.Capacitor && Capacitor.isNativePlatform()) {
            const { Filesystem, Share } = Capacitor.Plugins;
            try {
                await Filesystem.writeFile({ path: filename, data: csv, directory: 'CACHE', encoding: 'utf8' });
                const uriResult = await Filesystem.getUri({ directory: 'CACHE', path: filename });
                await Share.share({ title: 'Exportar CSV', files: [uriResult.uri] });
            } catch(e) {
                console.warn('Error al exportar CSV nativo:', e);
            }
        } else {
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    },
    initTheme: () => {
        const saved = localStorage.getItem('strength_app_theme');
        if (saved) { document.body.className = saved; }
        else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) { document.body.className = 'light'; }
        else { document.body.className = 'dark'; }
    },
    toggleTheme: () => {
        const current = document.body.className;
        const next = current === 'dark' ? 'light' : 'dark';
        document.body.className = next;
        localStorage.setItem('strength_app_theme', next);
    }
};
