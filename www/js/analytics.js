import { utils } from './utils.js';
import { getDb } from './data.js';

const round = (value) => Math.round(value * 10) / 10;
const valid = (value) => Number.isFinite(Number(value)) && Number(value) > 0;
const day = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const sessionKey = (weekId, sessionId) => `${weekId}:${sessionId}`;

function subtractNaturalMonths(now, months) {
    const targetMonth = now.getMonth() - months;
    const year = now.getFullYear() + Math.floor(targetMonth / 12);
    const month = (targetMonth % 12 + 12) % 12;
    const lastDay = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(now.getDate(), lastDay));
}

export const analytics = {
    exerciseKey: (exercise) => {
        const id = String(exercise.exercise_id || '').trim();
        const equipment = String(exercise.equipment_csv_name || exercise.machine_name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
        return id ? (equipment && !id.toLowerCase().includes(equipment) ? `${id}-${equipment}` : id) : `${String(exercise.name || 'ejercicio').toLowerCase().replace(/[^a-z0-9]+/g, '_')}-${equipment || 'general'}`;
    },
    estimate1RM: (load, reps) => {
        if (!valid(load) || !valid(reps)) return null;
        return round(Number(reps) === 1 ? Number(load) : Number(load) * (1 + Number(reps) / 30));
    },
    estimateAdjusted1RM: (load, reps, rir, openEnded = false) => openEnded || !Number.isInteger(rir) || rir < 0 || rir > 3 ? null : analytics.estimate1RM(load, Number(reps) + rir),
    classifyObservation: (set, completed) => {
        if (!completed || !valid(set.load) || !valid(set.reps)) return 'invalid';
        if (set.rir_is_open_ended || set.rir === null || set.rir === undefined || Number(set.reps) > 10) return 'informational';
        if (set.rir === 4 || Number(set.reps) >= 9) return 'low';
        return Number.isInteger(set.rir) && set.rir >= 0 && set.rir <= 3 ? 'high' : 'informational';
    },
    getObservations: (db = getDb()) => {
        const result = [];
        Object.entries(db.weeks || {}).forEach(([weekId, week]) => (week.sessions || []).forEach((session) => {
            const completed = session.session_completion?.status === 'completed';
            const date = completed ? day(session.session_completion.completed_at || session.session_completion.started_at) : null;
            (session.exercises || []).forEach((exercise) => (exercise.execution?.sets || []).forEach((set, index) => {
                const confidence = analytics.classifyObservation(set, completed);
                if (!date || confidence === 'invalid') return;
                result.push({ week_id: weekId, session_id: session.session_id, session_key: sessionKey(weekId, session.session_id), date,
                    exercise_key: analytics.exerciseKey(exercise), exercise_id: exercise.exercise_id || null, display_name: exercise.name || 'Ejercicio', equipment_name: exercise.equipment_csv_name || exercise.machine_name || 'General',
                    set_index: set.set_index ?? index, reps: Number(set.reps), load: Number(set.load), rir: set.rir ?? null, rir_is_open_ended: Boolean(set.rir_is_open_ended), notes: set.notes || '',
                    raw_e1rm: analytics.estimate1RM(set.load, set.reps), adjusted_e1rm: analytics.estimateAdjusted1RM(set.load, set.reps, set.rir, set.rir_is_open_ended), confidence });
            }));
        }));
        return result.sort((a, b) => a.date.localeCompare(b.date) || a.session_key.localeCompare(b.session_key));
    },
    getVariants: (db = getDb()) => [...new Map(analytics.getObservations(db).map(item => [item.exercise_key, { exercise_key: item.exercise_key, display_name: item.display_name, equipment_name: item.equipment_name }])).values()].sort((a, b) => `${a.display_name}${a.equipment_name}`.localeCompare(`${b.display_name}${b.equipment_name}`)),
    exposures: (db = getDb(), exerciseKey = null, bounds = null) => {
        const best = new Map();
        analytics.filterPeriod(analytics.getObservations(db), bounds).filter(item => (!exerciseKey || item.exercise_key === exerciseKey) && item.confidence === 'high').forEach((item) => {
            const key = `${item.exercise_key}:${item.session_key}:${item.date}`;
            if (!best.has(key) || best.get(key).adjusted_e1rm < item.adjusted_e1rm) best.set(key, item);
        });
        return [...best.values()].sort((a, b) => a.date.localeCompare(b.date) || a.session_key.localeCompare(b.session_key));
    },
    movingTrend: (exposures) => exposures.map((item, index) => ({ ...item, trend: round(exposures.slice(Math.max(0, index - 2), index + 1).reduce((sum, value) => sum + value.adjusted_e1rm, 0) / Math.min(3, index + 1)), consolidated: index >= 2 })),
    periodBounds: (period, seasons = {}, now = new Date()) => {
        const today = day(now);
        if (period === 'active_season') { const active = Object.values(seasons).find(item => !item.end_date); return active ? { start: active.start_date, end: today } : null; }
        if (period?.startsWith('season:')) { const season = seasons[period.slice(7)]; return season ? { start: season.start_date, end: season.end_date || today } : null; }
        if (period === 'last_30_days') return { start: day(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)), end: today };
        const months = { last_3_months: 3, last_6_months: 6, last_year: 12 }[period];
        return months ? { start: day(subtractNaturalMonths(now, months)), end: today } : { start: null, end: today };
    },
    filterPeriod: (items, bounds) => bounds === null ? [] : items.filter(item => (!bounds.start || item.date >= bounds.start) && (!bounds.end || item.date <= bounds.end)),
    completedSessions: (db, bounds) => {
        const entries = [];
        Object.entries(db.weeks || {}).forEach(([weekId, week]) => (week.sessions || []).forEach((session) => {
            const date = day(session.session_completion?.completed_at || session.session_completion?.started_at);
            if (session.session_completion?.status === 'completed' && date && analytics.filterPeriod([{ date }], bounds).length) entries.push({ key: sessionKey(weekId, session.session_id), date });
        }));
        return entries;
    },
    summarize: (db = getDb(), exerciseKey = null, bounds = analytics.periodBounds('all_time', db.seasons)) => {
        const observations = analytics.filterPeriod(analytics.getObservations(db), bounds).filter(item => !exerciseKey || item.exercise_key === exerciseKey);
        const exposures = analytics.exposures(db, exerciseKey, bounds);
        const hard = observations.filter(item => item.rir !== null && !item.rir_is_open_ended && item.rir >= 0 && item.rir <= 3);
        const planned = Object.entries(db.weeks || {}).flatMap(([weekId, week]) => (week.sessions || []).filter(session => session.scheduled_date && (!bounds?.start || session.scheduled_date >= bounds.start) && (!bounds?.end || session.scheduled_date <= bounds.end)).map(session => sessionKey(weekId, session.session_id)));
        const completed = analytics.completedSessions(db, bounds);
        const first = exposures[0] || null; const last = exposures.at(-1) || null; const best = exposures.reduce((winner, item) => !winner || item.adjusted_e1rm > winner.adjusted_e1rm ? item : winner, null);
        const actualCompleted = completed.length;
        return { observations, exposures, reference_e1rm: last?.adjusted_e1rm ?? null, reference_date: last?.date ?? null, first_e1rm: first?.adjusted_e1rm ?? null, last_e1rm: last?.adjusted_e1rm ?? null,
            change: first && last ? round(last.adjusted_e1rm - first.adjusted_e1rm) : null, change_percent: first && last ? round((last.adjusted_e1rm - first.adjusted_e1rm) / first.adjusted_e1rm * 100) : null,
            best_e1rm: best?.adjusted_e1rm ?? null, best_date: best?.date ?? null, tonnage: round(observations.reduce((sum, item) => sum + item.load * item.reps, 0)), reps: observations.reduce((sum, item) => sum + item.reps, 0), registered_sets: observations.length,
            hard_sets: hard.length, average_rir: hard.length ? round(hard.reduce((sum, item) => sum + item.rir, 0) / hard.length) : null, adherence: planned.length ? Math.min(100, round(actualCompleted / planned.length * 100)) : null, completed_sessions: actualCompleted, planned_sessions: planned.length, completed_session_keys: completed.map(item => item.key) };
    },
    isoWeek: (text) => { const date = new Date(`${text}T12:00:00`); date.setDate(date.getDate() - ((date.getDay() + 6) % 7)); return day(date); },
    weeklyLoad: (db = getDb(), exerciseKey = null, bounds) => {
        if (!bounds) return [];
        const buckets = new Map();
        const observations = analytics.filterPeriod(analytics.getObservations(db), bounds).filter(item => !exerciseKey || item.exercise_key === exerciseKey);
        if (!observations.length) return [];
        const start = bounds.start || observations[0].date;
        const end = bounds.end || observations.at(-1).date;
        for (let cursor = new Date(`${analytics.isoWeek(start)}T12:00:00`); cursor <= new Date(`${analytics.isoWeek(end)}T12:00:00`); cursor.setDate(cursor.getDate() + 7)) buckets.set(analytics.isoWeek(day(cursor)), { week: analytics.isoWeek(day(cursor)), tonnage: 0, hard_sets: 0, sets: 0, reps: 0 });
        observations.forEach((item) => { const bucket = buckets.get(analytics.isoWeek(item.date)); if (bucket) { bucket.tonnage += item.load * item.reps; bucket.sets += 1; bucket.reps += item.reps; if (item.rir !== null && !item.rir_is_open_ended && item.rir >= 0 && item.rir <= 3) bucket.hard_sets += 1; } });
        return [...buckets.values()];
    },
    intensityReferences: (db = getDb(), exerciseKey = null, bounds) => {
        const sessions = new Map();
        analytics.filterPeriod(analytics.getObservations(db), bounds).filter(item => !exerciseKey || item.exercise_key === exerciseKey).forEach(item => sessions.set(`${item.exercise_key}:${item.session_key}`, item));
        const references = new Map(); const prior = new Map();
        [...sessions.values()].sort((a, b) => a.date.localeCompare(b.date) || a.session_key.localeCompare(b.session_key)).forEach((session) => {
            const key = session.exercise_key; const current = analytics.exposures(db, key, { start: session.date, end: session.date }).filter(item => item.session_key === session.session_key).at(-1);
            references.set(`${key}:${session.session_key}`, prior.get(key) || current?.adjusted_e1rm || null);
            if (current) prior.set(key, current.adjusted_e1rm);
        });
        return references;
    },
    intensityDistribution: (db = getDb(), exerciseKey = null, bounds) => {
        const zones = ['<60%', '60–69%', '70–79%', '80–89%', '≥90%'].map(label => ({ label, reps: 0 }));
        const references = analytics.intensityReferences(db, exerciseKey, bounds);
        analytics.filterPeriod(analytics.getObservations(db), bounds).filter(item => !exerciseKey || item.exercise_key === exerciseKey).forEach((item) => {
            const reference = references.get(`${item.exercise_key}:${item.session_key}`);
            if (!reference) return; const ratio = item.load / reference * 100; zones[ratio < 60 ? 0 : ratio < 70 ? 1 : ratio < 80 ? 2 : ratio < 90 ? 3 : 4].reps += item.reps;
        });
        return zones;
    },
    comparableRir: (db = getDb(), exerciseKey = null, bounds) => {
        const exact = analytics.filterPeriod(analytics.getObservations(db), bounds).filter(item => (!exerciseKey || item.exercise_key === exerciseKey) && item.rir !== null && !item.rir_is_open_ended && item.rir >= 0 && item.rir <= 3);
        const groups = [];
        [...exact].sort((a, b) => a.date.localeCompare(b.date) || a.session_key.localeCompare(b.session_key) || b.load - a.load).forEach((item) => {
            let group = groups.find(candidate => Math.abs(item.load - candidate.load) / candidate.load <= 0.025);
            if (!group) { group = { load: item.load, items: [], latest: item.date }; groups.push(group); }
            group.items.push(item); if (item.date > group.latest) group.latest = item.date;
        });
        const candidates = groups.map((group) => {
            const perSession = new Map();
            group.items.forEach((item) => { const values = perSession.get(item.session_key) || []; values.push(item); perSession.set(item.session_key, values); });
            const observations = [...perSession.values()].map((items) => ({ ...items[0], load: round(items.reduce((sum, item) => sum + item.load, 0) / items.length), rir: round(items.reduce((sum, item) => sum + item.rir, 0) / items.length) })).sort((a, b) => a.date.localeCompare(b.date) || a.session_key.localeCompare(b.session_key));
            return { load: group.load, latest: group.latest, observations };
        }).filter(group => group.observations.length >= 3).sort((a, b) => b.latest.localeCompare(a.latest) || b.observations.length - a.observations.length || b.load - a.load);
        if (!candidates.length) return null;
        const selected = candidates[0];
        return { load: selected.load, observations: selected.observations, average_rir: round(selected.observations.reduce((sum, item) => sum + item.rir, 0) / selected.observations.length) };
    },
    getExerciseHistory: (exerciseKey) => analytics.getObservations().filter(item => item.exercise_key === exerciseKey).reverse(),
    getAllExercises: (db = getDb()) => analytics.getVariants(db),
    getBest1RM: (exerciseKey) => analytics.exposures(getDb(), exerciseKey).reduce((best, item) => Math.max(best, item.adjusted_e1rm), null),
    get1RMRecords: (exerciseKey) => { let best = null; return analytics.exposures(getDb(), exerciseKey).filter(item => { if (best !== null && item.adjusted_e1rm <= best) return false; best = item.adjusted_e1rm; return true; }).map((item, index, records) => ({ ...item, value: item.adjusted_e1rm, improvement: index ? round(item.adjusted_e1rm - records[index - 1].adjusted_e1rm) : 0 })).reverse(); },
    get1RMMonthlySummary: (exerciseKey) => [...analytics.exposures(getDb(), exerciseKey).reduce((months, item) => { const key = item.date.slice(0, 7); if (!months.has(key) || months.get(key).value < item.adjusted_e1rm) months.set(key, { month: key, value: item.adjusted_e1rm, date: item.date, reps: item.reps, load: item.load }); return months; }, new Map()).values()].reverse(),
    getRecentSets: (exerciseKey, days = 30) => { const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days); return analytics.getExerciseHistory(exerciseKey).filter(item => new Date(`${item.date}T12:00:00`) >= cutoff).map(item => ({ ...item, estimated1RM: item.raw_e1rm })); },
    exportToCSV: (exerciseKey, period = 'all_time', db = getDb()) => { const history = analytics.filterPeriod(analytics.getObservations(db).filter(item => item.exercise_key === exerciseKey), analytics.periodBounds(period, db.seasons)); if (!history.length) return null; const esc = value => { const text = String(value ?? ''); return `"${(/^[=+\-@]/.test(text) ? "'" : '') + text.replace(/"/g, '""')}"`; }; return `Fecha,Variante,Máquina,Set,Reps,Carga,RIR,RIR_Abierto,e1RM_Bruto,e1RM_Ajustado,Confianza,Tonelaje,Notas\n${history.map(item => [item.date,item.exercise_key,item.equipment_name,item.set_index + 1,item.reps,item.load,item.rir ?? '',item.rir_is_open_ended,item.raw_e1rm ?? '',item.adjusted_e1rm ?? '',item.confidence,item.load * item.reps,item.notes].map(esc).join(',')).join('\n')}\n`; },
    exportToJSON: (exerciseKey, period = 'all_time', db = getDb()) => { const bounds = analytics.periodBounds(period, db.seasons); return { exercise_key: exerciseKey, period: bounds, metrics: analytics.summarize(db, exerciseKey, bounds), history: analytics.filterPeriod(analytics.getObservations(db).filter(item => item.exercise_key === exerciseKey), bounds) }; },
    exportAll1RMs: (db = getDb()) => ({ exported_at: utils.isoNow(), total_exercises: analytics.getVariants(db).length, exercises: analytics.getVariants(db).map(item => ({ ...item, best_1rm: analytics.summarize(db, item.exercise_key).best_e1rm, records: analytics.get1RMRecords(item.exercise_key) })) }),
    exportAll1RMsCSV: (db = getDb()) => `Variante,Máquina,Mejor e1RM (kg)\n${analytics.getVariants(db).map(item => `"${item.exercise_key.replace(/"/g, '""')}","${item.equipment_name.replace(/"/g, '""')}",${analytics.summarize(db, item.exercise_key).best_e1rm ?? ''}`).join('\n')}\n`
};
