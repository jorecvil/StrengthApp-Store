import { utils } from './utils.js';
import { validate } from './validate.js';
import { analytics } from './analytics.js';

export const seasons = {
    active: (db) => Object.values(db.seasons || {}).find(season => !season.end_date) || null,
    list: (db) => Object.values(db.seasons || {}).sort((a, b) => b.start_date.localeCompare(a.start_date)),
    normalizeActiveSeasons: (rawSeasons) => validate.sanitizeSeasons(rawSeasons),
    prepareCreate: (db, input) => {
        const start = validate.date(input.start_date);
        if (!start) throw new Error('La fecha de inicio es obligatoria y válida');
        const current = seasons.active(db);
        const seasonId = utils.uuid();
        const season = validate.sanitizeSeasons({ [seasonId]: { ...input, season_id: seasonId, start_date: start, end_date: null, created_at: utils.isoNow(), modified_at: utils.isoNow() } })[seasonId];
        if (!season) throw new Error('Temporada inválida');
        let proposedCloseDate = null;
        if (current) {
            const closeDate = new Date(`${start}T12:00:00`);
            closeDate.setDate(closeDate.getDate() - 1);
            proposedCloseDate = `${closeDate.getFullYear()}-${String(closeDate.getMonth() + 1).padStart(2, '0')}-${String(closeDate.getDate()).padStart(2, '0')}`;
            if (proposedCloseDate < current.start_date) throw new Error('La nueva temporada debe comenzar después de la activa');
        }
        return { season, activeSeason: current, proposedCloseDate, requiresConfirmation: Boolean(current) };
    },
    applyCreate: (db, prepared) => {
        if (!prepared?.season) throw new Error('Creación de temporada inválida');
        db.seasons = db.seasons || {};
        if (prepared.activeSeason) {
            const active = db.seasons[prepared.activeSeason.season_id];
            if (!active || active.end_date || prepared.proposedCloseDate < active.start_date) throw new Error('La temporada activa cambió; revisa la creación');
            active.end_date = prepared.proposedCloseDate;
            active.modified_at = utils.isoNow();
        }
        db.seasons[prepared.season.season_id] = prepared.season;
        db.seasons = seasons.normalizeActiveSeasons(db.seasons);
        return prepared.season;
    },
    create: (db, input) => {
        const prepared = seasons.prepareCreate(db, input);
        if (prepared.requiresConfirmation) throw new Error('Confirma el cierre de la temporada activa antes de crear otra');
        return seasons.applyCreate(db, prepared);
    },
    close: (db, seasonId, endDate) => {
        const season = db.seasons?.[seasonId];
        const end = validate.date(endDate);
        if (!season || !end || end < season.start_date) throw new Error('Fecha de cierre inválida');
        season.end_date = end;
        season.modified_at = utils.isoNow();
        return season;
    },
    update: (db, seasonId, input) => {
        const season = db.seasons?.[seasonId];
        if (!season) throw new Error('Temporada no encontrada');
        const candidate = validate.sanitizeSeasons({ [seasonId]: { ...season, ...input, season_id: seasonId, modified_at: utils.isoNow() } })[seasonId];
        if (!candidate) throw new Error('Temporada inválida');
        if (!candidate.end_date && Object.values(db.seasons || {}).some(item => item.season_id !== seasonId && !item.end_date)) throw new Error('Ya existe una temporada activa');
        db.seasons[seasonId] = candidate;
        return candidate;
    },
    remove: (db, seasonId) => { if (db.seasons) delete db.seasons[seasonId]; },
    summary: (db, seasonId) => {
        const season = db.seasons?.[seasonId];
        if (!season) return null;
        const bounds = analytics.periodBounds(`season:${seasonId}`, db.seasons);
        return {
            season,
            summary: analytics.summarize(db, null, bounds),
            exercises: season.priority_exercise_keys.map((key) => {
                const current = analytics.summarize(db, key, bounds);
                const previous = seasons.list(db).filter(item => item.end_date && item.end_date < season.start_date && item.priority_exercise_keys.includes(key)).at(0);
                const previousMetrics = previous ? analytics.summarize(db, key, analytics.periodBounds(`season:${previous.season_id}`, db.seasons)) : null;
                return { exercise_key: key, metrics: current, previous: previousMetrics ? { season_id: previous.season_id, first_e1rm: previousMetrics.first_e1rm, last_e1rm: previousMetrics.last_e1rm, best_e1rm: previousMetrics.best_e1rm, best_date: previousMetrics.best_date, change: previousMetrics.change, change_percent: previousMetrics.change_percent, tonnage: previousMetrics.tonnage, reps: previousMetrics.reps, hard_sets: previousMetrics.hard_sets, completed_sessions: previousMetrics.completed_sessions, planned_sessions: previousMetrics.planned_sessions, adherence: previousMetrics.adherence } : null };
            })
        };
    }
};
