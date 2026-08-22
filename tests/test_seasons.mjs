import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { validate } = await import(new URL('../www/js/validate.js', import.meta.url).href);
const { seasons } = await import(new URL('../www/js/seasons.js', import.meta.url).href);

const raw = {
    old: { season_id: 'old', name: 'Antigua', start_date: '2026-01-01', end_date: null, modified_at: 'invalid', created_at: '2026-01-01T00:00:00Z' },
    newest: { season_id: 'newest', name: 'Nueva', start_date: '2026-03-01', end_date: null, modified_at: '2026-03-02T00:00:00Z', created_at: '2026-03-01T00:00:00Z' }
};
const normalized = validate.sanitizeSeasons(raw);
assert.equal(Object.values(normalized).filter((season) => !season.end_date).length, 1);
assert.equal(normalized.newest.end_date, null);
assert.equal(normalized.old.end_date >= normalized.old.start_date, true);
assert.deepEqual(validate.sanitizeSeasons(normalized), normalized);

const db = { seasons: {}, weeks: {} };
const prepared = seasons.prepareCreate(db, { name: 'Bloque', start_date: '2026-04-01', objective: 'strength' });
assert.equal(prepared.requiresConfirmation, false);
seasons.applyCreate(db, prepared);
const replacement = seasons.prepareCreate(db, { name: 'Bloque 2', start_date: '2026-05-01', objective: 'strength' });
assert.equal(replacement.requiresConfirmation, true);
assert.equal(seasons.active(db).end_date, null);
seasons.applyCreate(db, replacement);
assert.equal(Object.values(db.seasons).filter((season) => !season.end_date).length, 1);
console.log('Season tests completed');
