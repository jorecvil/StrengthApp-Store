import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.document = { body: { className: 'dark' }, getElementById: () => ({ innerHTML: '', classList: { add: () => {}, remove: () => {} } }) };
globalThis.window = { matchMedia: () => ({ matches: true }) };

const moduleUrl = (file) => new URL(`../www/js/${file}`, import.meta.url).href;
const { analytics } = await import(moduleUrl('analytics.js'));
const { seasons } = await import(moduleUrl('seasons.js'));
const { utils } = await import(moduleUrl('utils.js'));

const db = { schema_version: 3, seasons: {}, weeks: { one: { week: { week_number: 1 }, sessions: [{ session_id: 'a', scheduled_date: '2026-08-01', session_completion: { status: 'completed', completed_at: '2026-08-01T10:00:00Z' }, exercises: [
    { exercise_id: 'press', name: 'Press', machine_name: 'Máquina A', execution: { sets: [{ reps: 8, load: 80, rir: 2, rir_is_open_ended: false }] } },
    { exercise_id: 'press', name: 'Press', machine_name: 'Máquina B', execution: { sets: [{ reps: 8, load: 70, rir: 4, rir_is_open_ended: true }] } }
] }] } } };

assert.equal(analytics.estimateAdjusted1RM(80, 8, 2), 106.7);
assert.equal(analytics.estimateAdjusted1RM(80, 8, 4, true), null);
assert.equal(analytics.classifyObservation({ load: 80, reps: 8, rir: 4, rir_is_open_ended: true }, true), 'informational');
assert.equal(analytics.getVariants(db).length, 2);
const metrics = analytics.summarize(db, analytics.getVariants(db)[0].exercise_key, { start: '2026-08-01', end: '2026-08-01' });
assert.equal(metrics.tonnage, 640);
assert.equal(metrics.adherence, 100);
assert.deepEqual(analytics.weeklyLoad(db, analytics.getVariants(db)[0].exercise_key, { start: '2026-08-01', end: '2026-08-01' }).map(item => item.tonnage), [640]);
assert.equal(analytics.intensityDistribution(db, analytics.getVariants(db)[0].exercise_key, { start: '2026-08-01', end: '2026-08-01' }).reduce((sum, item) => sum + item.reps, 0), 8);
const season = seasons.create(db, { name: 'Fuerza', start_date: '2026-08-01', objective: 'strength' });
assert.equal(seasons.active(db).season_id, season.season_id);
assert.throws(() => seasons.close(db, season.season_id, '2026-07-31'));
seasons.close(db, season.season_id, '2026-08-31');
assert.equal(seasons.active(db), null);
assert.equal(utils.migrateSchema({ schema_version: 2, weeks: db.weeks }).schema_version, 3);
const comparableDb = structuredClone(db);
const comparableExercise = comparableDb.weeks.one.sessions[0].exercises[0];
comparableDb.weeks.one.sessions.push(
    { ...structuredClone(comparableDb.weeks.one.sessions[0]), session_id: 'b', session_completion: { status: 'completed', completed_at: '2026-08-01T11:00:00Z' }, exercises: [{ ...comparableExercise, execution: { sets: [{ reps: 7, load: 80, rir: 2, rir_is_open_ended: false }] } }] },
    { ...structuredClone(comparableDb.weeks.one.sessions[0]), session_id: 'c', session_completion: { status: 'completed', completed_at: '2026-08-01T12:00:00Z' }, exercises: [{ ...comparableExercise, execution: { sets: [{ reps: 6, load: 80, rir: 1, rir_is_open_ended: false }] } }] }
);
assert.equal(analytics.comparableRir(comparableDb, analytics.getVariants(comparableDb)[0].exercise_key, { start: '2026-08-01', end: '2026-08-01' }).average_rir, 1.7);
console.log('Analítica y temporadas: assertions completed');
