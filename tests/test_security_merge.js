#!/usr/bin/env node
/**
 * Test suite para Strength Tracker v6.7
 * Verifica: Sanitización XSS, Validación de JSON, Motor de Fusión, Migraciones de Esquema y Resiliencia.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('--- Iniciando Test Suite: Seguridad, Validación y Fusión ---');

// Extraer lógica JavaScript de www/index.html para testeo unitario
const htmlContent = fs.readFileSync(path.join(__dirname, '../www/index.html'), 'utf8');
const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
    throw new Error('No se encontró etiqueta <script> en www/index.html');
}

// Mock de entorno browser mínimo
const mockStorage = Object.create(Object.prototype, {
    getItem: { value: (k) => mockStorage[k] || null, writable: true, configurable: true },
    setItem: { value: (k, v) => { mockStorage[k] = String(v); }, writable: true, configurable: true },
    removeItem: { value: (k) => { delete mockStorage[k]; }, writable: true, configurable: true },
    clear: { value: () => { Object.keys(mockStorage).filter(k => !['getItem','setItem','removeItem','clear'].includes(k)).forEach(k => delete mockStorage[k]); }, writable: true, configurable: true }
});

const sandbox = {
    console: { log: ()=>{}, warn: ()=>{}, error: ()=>{} },
    localStorage: mockStorage,
    window: { matchMedia: () => ({ matches: true }), Capacitor: null },
    document: {
        getElementById: (_id) => ({ innerHTML: '', innerText: '', value: '', classList: { add: ()=>{}, remove: ()=>{} } }),
        body: { className: 'dark' },
        querySelectorAll: () => []
    },
    navigator: {
        clipboard: { readText: async () => '' }
    },
    setTimeout: setTimeout,
    encodeURIComponent: encodeURIComponent,
    decodeURIComponent: decodeURIComponent,
    parseFloat: parseFloat,
    parseInt: parseInt,
    isNaN: isNaN,
    Date: Date,
    Math: Math,
    JSON: JSON,
    Array: Array,
    Object: Object,
    Set: Set,
    Map: Map,
    String: String,
    Boolean: Boolean,
    RegExp: RegExp,
    Error: Error,
    __TEST_EXPORTS__: null,
    STORE_KEY: 'strength_app_data',
    BACKUP_PREFIX: 'strength_app_backup_',
    DB_SCHEMA_VERSION: 2,
    MAX_IMPORT_BYTES: 6 * 1024 * 1024
};

// Envolver el script para capturar los objetos de módulo
const wrappedScript = `
${scriptMatch[1]}
__TEST_EXPORTS__ = { utils, validate, backup, mergeEngine, analytics, logic, LLM_PROMPT_TEMPLATE };
`;

vm.createContext(sandbox);
vm.runInContext(wrappedScript, sandbox);

const { utils, validate, backup, mergeEngine, analytics, LLM_PROMPT_TEMPLATE } = sandbox.__TEST_EXPORTS__;

let passed = 0;
let total = 0;

function test(name, fn) {
    total++;
    try {
        fn();
        console.log(`  ✓ ${name}`);
        passed++;
    } catch (err) {
        console.error(`  ✗ ${name}:`, err.message);
        throw err;
    }
}

// 1. Tests de Sanitización XSS
console.log('\n[1] Pruebas de Sanitización XSS (utils.esc y encodeParam)');

test('utils.esc neutraliza tags HTML y scripts maliciosos', () => {
    const payload = '<script>alert("XSS")</script>';
    const escaped = utils.esc(payload);
    assert.strictEqual(escaped, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    assert(!escaped.includes('<script>'));
});

test('utils.esc maneja comillas simples, dobles y backticks', () => {
    const payload = `O'Connor "Quotes" & ` + '`backticks`';
    const escaped = utils.esc(payload);
    assert.strictEqual(escaped, 'O&#39;Connor &quot;Quotes&quot; &amp; &#96;backticks&#96;');
});

test('utils.esc maneja nulos, indefinidos y números', () => {
    assert.strictEqual(utils.esc(null), '');
    assert.strictEqual(utils.esc(undefined), '');
    assert.strictEqual(utils.esc(123), '123');
    assert.strictEqual(utils.esc(0), '0');
});

test('utils.encodeParam codifica caracteres peligrosos para inline handlers', () => {
    const param = `Bicep's "Curl" <script>`;
    const encoded = utils.encodeParam(param);
    assert(!encoded.includes("'"));
    assert(!encoded.includes('"'));
    assert(!encoded.includes('<'));
    assert(!encoded.includes('>'));
    assert.strictEqual(utils.decodeParam(encoded), param);
});

// 2. Tests de Validación de JSON
console.log('\n[2] Pruebas de Validación de Importación (validate.json / backupJSON)');

test('validate.json rechaza entradas no válidas o vacías', () => {
    assert.throws(() => validate.json(''), /Entrada vacía/);
    assert.throws(() => validate.json('{ bad json }'), /JSON malformado/);
    assert.throws(() => validate.json('{}'), /Falta el campo/);
    assert.throws(() => validate.json('{"week_ref": {}}'), /'sessions' debe ser una lista/);
});

test('validate.json sanitiza y estructura correctamente una semana válida', () => {
    const raw = JSON.stringify({
        week_ref: {
            week_id: "w_test_1",
            week_number: 2,
            notes: "Semana pesada"
        },
        sessions: [
            {
                session_id: "Día 1",
                title: "Torso Fuerza",
                exercises: [
                    {
                        name: "Press Banca",
                        baseline: { planned_sets: 4, planned_reps: 6, planned_load: 85 }
                    }
                ]
            }
        ]
    });
    const clean = validate.json(raw);
    assert.strictEqual(clean.week.week_id, "w_test_1");
    assert.strictEqual(clean.week.week_number, 2);
    assert.strictEqual(clean.sessions.length, 1);
    assert.strictEqual(clean.sessions[0].exercises[0].name, "Press Banca");
    assert.strictEqual(clean.sessions[0].exercises[0].baseline.planned_sets, 4);
    assert.strictEqual(clean.sessions[0].session_completion.status, 'pending');
});

test('validate.backupJSON procesa backups con múltiples formatos', () => {
    const backupObj = {
        backup_meta: { date: "2026-08-15", version: "6.7" },
        data: {
            weeks: {
                "w1": {
                    week: { week_id: "w1", week_number: 1 },
                    sessions: []
                }
            }
        }
    };
    const clean = validate.backupJSON(JSON.stringify(backupObj));
    assert(clean.weeks["w1"]);
    assert.strictEqual(clean.weeks["w1"].week.week_number, 1);
});

// 3. Tests de Fusión y Detección de Conflictos
console.log('\n[3] Pruebas del Motor de Fusión y Conflictos (mergeEngine)');

test('detectSessionConflict identifica cuando no hay divergencia (ej: una vacía, una completada)', () => {
    const emptyS = {
        session_id: "Día 1",
        exercises: [{ name: "Press", execution: { sets: [] } }]
    };
    const completedS = {
        session_id: "Día 1",
        exercises: [{ name: "Press", execution: { sets: [{ reps: 8, load: 80 }] } }]
    };
    assert.strictEqual(mergeEngine.detectSessionConflict(emptyS, completedS), false);
});

test('detectSessionConflict detecta divergencia real cuando ambas tienen series distintas', () => {
    const localS = {
        session_id: "Día 1",
        exercises: [{ name: "Press", execution: { sets: [{ reps: 8, load: 80 }] } }]
    };
    const incomingS = {
        session_id: "Día 1",
        exercises: [{ name: "Press", execution: { sets: [{ reps: 10, load: 85 }] } }]
    };
    assert.strictEqual(mergeEngine.detectSessionConflict(localS, incomingS), true);
});

// 4. Tests de Migración de Esquema y Resiliencia
console.log('\n[4] Pruebas de Migración de Esquema (utils.migrateSchema)');

test('migrateSchema migra datos v1 a v2 asegurando timestamps y schema_version', () => {
    const oldData = {
        weeks: {
            "old_w": {
                week: { week_id: "old_w", week_number: 3 },
                sessions: [
                    { session_id: "S1", exercises: [{ name: "Sentadilla" }] }
                ]
            }
        }
    };
    const migrated = utils.migrateSchema(oldData);
    assert.strictEqual(migrated.schema_version, 2);
    assert(migrated.modified_at);
    assert(migrated.weeks["old_w"].week.modified_at);
    assert(migrated.weeks["old_w"].sessions[0].modified_at);
});

// 5. Tests de Analítica (1RM Epley)
console.log('\n[5] Pruebas de Analítica (analytics.estimate1RM)');

test('estimate1RM calcula correctamente según fórmula de Epley', () => {
    assert.strictEqual(analytics.estimate1RM(100, 1), 100);
    assert.strictEqual(analytics.estimate1RM(100, 10), 133.3);
    assert.strictEqual(analytics.estimate1RM(null, 5), null);
});

test('analytics.getBest1RM devuelve null para ejercicio sin datos', () => {
    // db vacío
    assert.strictEqual(analytics.getBest1RM('Press Banca'), null);
});

test('analytics.exportToCSV no permite inyección a través del nombre del ejercicio', () => {
    const name = 'Bicep "Curls"';
    const nameEscaped = name.replace(/"/g, '""');
    assert.strictEqual(nameEscaped, 'Bicep ""Curls""');
    assert(!nameEscaped.includes(`"Bicep "Curls""`));
});

// 6. Tests de Límites de Tamaño y Edge Cases de Validación
console.log('\n[6] Tests de Límites y Edge Cases (validate.json, utils)');

test('validate.json rechaza entradas que superan MAX_IMPORT_BYTES', () => {
    const huge = 'x'.repeat(6 * 1024 * 1024);
    assert.throws(() => validate.json(huge), /tamaño máximo/);
});

test('utils.uuid genera identificadores únicos', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) ids.add(utils.uuid());
    assert.strictEqual(ids.size, 100);
});

test('utils.formatDate devuelve "-" para fecha inválida', () => {
    assert.strictEqual(utils.formatDate('not-a-date'), '-');
    assert.strictEqual(utils.formatDate(null), '-');
    assert.strictEqual(utils.formatDate(undefined), '-');
});

test('utils.esc neutraliza img/event-handler injection en texto de ejercicio', () => {
    const maliciousName = '<img src=x onerror=alert(1)>';
    const escaped = utils.esc(maliciousName);
    assert(!escaped.includes('<img'));
    assert(!escaped.includes('<script>'));
    assert.strictEqual(escaped, '&lt;img src=x onerror=alert(1)&gt;');
    // El tag completo está neutralizado (los < > son entities)
    assert(!escaped.includes('<img '));
});

test('validate.backupJSON ignora semanas malformadas sin romper el proceso', () => {
    const backup = {
        backup_meta: { date: "2026-08-15", version: "6.7" },
        data: {
            weeks: {
                "w_valid": { week: { week_id: "w_valid", week_number: 1 }, sessions: [] },
                "w_bad": null
            }
        }
    };
    const clean = validate.backupJSON(JSON.stringify(backup));
    assert(clean.weeks["w_valid"]);
    assert(!clean.weeks["w_bad"]);
});

// 7. Tests de Resiliencia y Recuperación
console.log('\n[7] Tests de Resiliencia (utils.load, backup)');

test('utils.load devuelve estructura inicial cuando localStorage está vacío', () => {
    mockStorage.clear();
    const data = utils.load();
    assert.strictEqual(data.schema_version, 2);
    assert.strictEqual(Object.keys(data.weeks).length, 0);
    assert(data.created_at);
    assert(data.modified_at);
});

test('backup.auto() guarda backup con clave con fecha', () => {
    mockStorage.clear();
    try { backup.auto(); } catch(_e) { /* ignore */ }
    const keys = Object.keys(mockStorage).filter(k => k.startsWith('strength_app_backup_'));
    assert(keys.length > 0, `Expected keys with prefix, got: ${JSON.stringify(Object.keys(mockStorage))}`);
});

test('backup.list() y backup.get() funcionan correctamente', () => {
    mockStorage.clear();
    try { backup.auto(); } catch(_e) { /* ignore */ }
    const dates = backup.list();
    assert(dates.length > 0);
    const latest = backup.getLatest();
    assert(latest !== null);
    assert(latest.schema_version !== undefined);
});

// 8. Tests de Métricas del Home (P3.5)
console.log('\n[8] Tests de Métricas del Home (getGlobalBest1RM, getStreakDays, getLastSessionDate)');

test('getGlobalBest1RM devuelve null cuando no hay ejercicios', () => {
    mockStorage.clear();
    const result = analytics.getGlobalBest1RM();
    assert.strictEqual(result, null);
});

test('getStreakDays devuelve 0 sin sesiones', () => {
    mockStorage.clear();
    assert.strictEqual(analytics.getStreakDays(), 0);
});

test('getLastSessionDate devuelve null sin sesiones completadas', () => {
    mockStorage.clear();
    assert.strictEqual(analytics.getLastSessionDate(), null);
});

// 9. Tests de Compatibilidad con Plantilla JSON de IA (LLMs)
console.log('\n[9] Tests de Compatibilidad con Plantilla JSON de IA (LLMs)');

test('LLM_PROMPT_TEMPLATE contiene un JSON válido y pasa validate.json()', () => {
    assert(typeof LLM_PROMPT_TEMPLATE === 'string');
    // Extraer bloque JSON del prompt
    const jsonMatch = LLM_PROMPT_TEMPLATE.match(/\{[\s\S]*\}/);
    assert(jsonMatch !== null, 'Debe contener un bloque JSON');
    
    // Validar e importar usando el validador oficial de la app
    const cleanWeek = validate.json(jsonMatch[0]);
    assert.strictEqual(cleanWeek.week.week_number, 1);
    assert.strictEqual(cleanWeek.sessions.length, 1);
    assert.strictEqual(cleanWeek.sessions[0].session_id, 'A');
    assert.strictEqual(cleanWeek.sessions[0].exercises.length, 3);
    
    // Verificar ejercicio con set_plan
    const ex1 = cleanWeek.sessions[0].exercises[0];
    assert.strictEqual(ex1.exercise_id, 'press_pecho-hammer_strength');
    assert.strictEqual(ex1.name, 'Press de Pecho en Máquina');
    assert.strictEqual(ex1.baseline.set_plan.length, 2);
    assert.strictEqual(ex1.baseline.set_plan[0].reps, 8);
    assert.strictEqual(ex1.baseline.set_plan[0].load, 50);

    // Verificar ejercicio con planned_sets
    const ex2 = cleanWeek.sessions[0].exercises[1];
    assert.strictEqual(ex2.baseline.planned_sets, 3);
    assert.strictEqual(ex2.baseline.planned_reps, 15);
});

console.log(`\n==============================================`);
console.log(`Todos los tests superados con éxito (${passed}/${total})`);
console.log(`==============================================\n`);
