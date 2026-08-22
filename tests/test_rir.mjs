import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.document = { body: { className: 'dark' }, getElementById: () => ({ innerHTML: '', classList: { add: () => {}, remove: () => {} } }) };
globalThis.window = { matchMedia: () => ({ matches: true }) };
const { utils } = await import(new URL('../www/js/utils.js', import.meta.url).href);

const db = utils.migrateSchema({ schema_version: 3, weeks: { week: { sessions: [{ scheduled_date: null, exercises: [{ execution: { sets: [{ rir: 4 }, { rir: 4, rir_is_open_ended: true }, { rir: 2 }] } }] }] } } });
const sets = db.weeks.week.sessions[0].exercises[0].execution.sets;
assert.equal(sets[0].rir_is_open_ended, false);
assert.equal(sets[1].rir_is_open_ended, true);
assert.equal(sets[2].rir_is_open_ended, false);
assert.deepEqual(utils.migrateSchema(db), db);
console.log('RIR tests completed');
