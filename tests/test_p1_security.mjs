import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const storage = Object.create(null);
Object.defineProperties(storage, {
    getItem: { value: (key) => Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null },
    setItem: { value: (key, value) => { storage[key] = String(value); } },
    removeItem: { value: (key) => { delete storage[key]; } },
    clear: { value: () => Object.keys(storage).forEach((key) => delete storage[key]) }
});

globalThis.localStorage = storage;
const appElement = {
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {} },
    innerHTML: '',
    innerText: '',
    value: ''
};
const toastElement = {
    classList: { add: () => {}, remove: () => {} },
    innerText: ''
};
globalThis.document = {
    body: { className: 'dark' },
    getElementById: (id) => id === 'app' ? appElement : toastElement
};
globalThis.window = { matchMedia: () => ({ matches: true }), Capacitor: null };
Object.defineProperty(globalThis, 'navigator', {
    value: { clipboard: { readText: async () => '' } },
    configurable: true
});
globalThis.confirm = () => true;

const moduleUrl = (file) => pathToFileURL(new URL(`../www/js/${file}`, import.meta.url).pathname).href;
const { utils } = await import(moduleUrl('utils.js'));
const { validate } = await import(moduleUrl('validate.js'));
const { backup } = await import(moduleUrl('backup.js'));
const { mergeEngine } = await import(moduleUrl('merge.js'));

let passed = 0;
const test = async (name, fn) => {
    try {
        await fn();
        passed += 1;
        console.log(`  ✓ ${name}`);
    } catch (error) {
        console.error(`  ✗ ${name}: ${error.message}`);
        throw error;
    }
};

console.log('--- P1: Seguridad, validación, merge y backups ---');

await test('neutraliza payloads XSS para texto renderizado', () => {
    const payload = '<img src=x onerror="alert(1)"><script>alert(1)</script>';
    const escaped = utils.esc(payload);
    assert.equal(escaped.includes('<img'), false);
    assert.equal(escaped.includes('<script'), false);
    assert.equal(escaped.includes('&lt;img'), true);
});

await test('reemplaza IDs inseguros por UUIDs sin rechazar la importación', () => {
    const clean = validate.json(JSON.stringify({
        week_ref: { week_id: 'week"><script>', week_number: 1 },
        sessions: [{
            session_id: 'session onclick=alert(1)',
            exercises: [{ exercise_id: 'exercise/../../x', name: '<img src=x onerror=alert(1)>' }]
        }]
    }));

    assert.match(clean.week.week_id, /^[a-zA-Z0-9_-]+$/);
    assert.match(clean.sessions[0].session_id, /^[a-zA-Z0-9_-]+$/);
    assert.match(clean.sessions[0].exercises[0].exercise_id, /^[a-zA-Z0-9_-]+$/);
    assert.equal(utils.esc(clean.sessions[0].exercises[0].name).includes('<img'), false);
});

await test('rechaza week_ref como array y limita el tamaño de importación', () => {
    assert.throws(() => validate.json(JSON.stringify({ week_ref: [], sessions: [] })), /week_ref/);
    assert.throws(() => validate.json('x'.repeat(5 * 1024 * 1024 + 1)), /tamaño máximo/);
});

await test('normaliza target_1rm válido y descarta valores fuera de rango', () => {
    const valid = validate.json(JSON.stringify({
        week_ref: { week_id: 'week_1', week_number: 1 },
        sessions: [{ session_id: 'session_1', exercises: [{ exercise_id: 'exercise_1', name: 'Press', target_1rm: { value: 120, date: '2026-08-21' } }] }]
    }));
    assert.deepEqual(valid.sessions[0].exercises[0].target_1rm, { value: 120, date: '2026-08-21' });

    const invalid = validate.json(JSON.stringify({
        week_ref: { week_id: 'week_2', week_number: 1 },
        sessions: [{ session_id: 'session_2', exercises: [{ exercise_id: 'exercise_2', name: 'Press', target_1rm: { value: 1001 } }] }]
    }));
    assert.equal(invalid.sessions[0].exercises[0].target_1rm, null);
});

await test('usa timestamps para evitar conflictos falsos y elegir la versión reciente', () => {
    const local = {
        modified_at: '2026-08-21T10:00:00.000Z',
        exercises: [{ execution: { sets: [{ reps: 8, load: 80 }] } }]
    };
    const incoming = {
        modified_at: '2026-08-21T10:01:00.000Z',
        exercises: [{ execution: { sets: [{ reps: 10, load: 85 }] } }]
    };
    assert.equal(mergeEngine.detectSessionConflict(local, incoming), false);
    assert.equal(mergeEngine.pickLatest(local, incoming), incoming);

    const simultaneous = { ...incoming, modified_at: '2026-08-21T10:00:02.000Z' };
    assert.equal(mergeEngine.detectSessionConflict(local, simultaneous), true);
});

await test('prioriza una sesión con series registradas frente a una vacía', () => {
    const completed = { exercises: [{ execution: { sets: [{ reps: 8, load: 80 }] } }] };
    const empty = { exercises: [{ execution: { sets: [] } }] };
    assert.equal(mergeEngine.detectSessionConflict(completed, empty), false);
});

await test('crea backups con timestamp completo y valida su integridad', () => {
    storage.clear();
    storage.strength_app_v6_data = JSON.stringify({ schema_version: 2, weeks: {} });
    backup.auto();
    const timestamps = backup.list();
    assert.equal(timestamps.length, 1);
    assert.match(timestamps[0], /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(backup.validateIntegrity(backup.get(timestamps[0])), true);
    assert.throws(() => backup.validateIntegrity({ schema_version: 2 }), /falta weeks/);
});

await test('ignora backups corruptos sin interrumpir la restauración', () => {
    storage.strength_app_backup_corrupt = '{not-json';
    assert.equal(backup.get('corrupt'), null);
});

await test('libera backups antiguos cuando el almacenamiento supera el umbral', () => {
    storage.clear();
    storage.strength_app_backup_2026_01_01 = 'x'.repeat(2_100_000);
    storage.strength_app_backup_2026_01_02 = 'x'.repeat(2_100_000);
    storage.strength_app_backup_2026_01_03 = 'x'.repeat(2_100_000);
    const result = utils.quotaCheck(true);
    assert.equal(result.freed > 0, true);
    assert.equal(Object.keys(storage).filter((key) => key.startsWith('strength_app_backup_')).length, 2);
});

await test('tolera un plugin Capacitor App ausente', async () => {
    const { initAppListeners } = await import(moduleUrl('capacitor-adapter.js'));
    window.Capacitor = {};
    await assert.doesNotReject(initAppListeners());
});

await test('renderiza aunque el registro nativo del botón Atrás falle', async () => {
    window.Capacitor = {
        Plugins: {
            App: { addListener: async () => { throw new Error('plugin unavailable'); } }
        }
    };
    await import(moduleUrl('app.js'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(typeof window.actions.openImport, 'function');
    assert.equal(typeof window.logic.createManualWeek, 'function');
    assert.equal(appElement.innerHTML.includes('Strength Tracker'), true);
    window.Capacitor = null;
});

console.log(`P1 tests superados: ${passed}/11`);
